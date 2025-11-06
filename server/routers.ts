import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { sdk } from "./_core/sdk";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    uploadProfilePhoto: protectedProcedure
      .input(z.object({ photoUrl: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        await db.update(users)
          .set({ profilePhoto: input.photoUrl })
          .where(eq(users.id, ctx.user.id));
        
        return { success: true };
      }),

    // Local registration
    register: publicProcedure
      .input(z.object({
        username: z.string().min(3).max(50),
        password: z.string().min(6),
        name: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const user = await db.createLocalUser(input.username, input.password, input.name);
          
          // Create session
          const token = await sdk.createSessionToken(user.openId, { name: user.name || user.username || '' });
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, token, cookieOptions);
          
          return { success: true, user };
        } catch (error: any) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message || 'Registration failed',
          });
        }
      }),

    // Local login
    login: publicProcedure
      .input(z.object({
        username: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.verifyLocalUser(input.username, input.password);
        
        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid username or password',
          });
        }
        
        // Create session
        const token = await sdk.createSessionToken(user.openId, { name: user.name || user.username || '' });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);
        
        return { success: true, user };
      }),
  }),

  // Match management (admin only)
  matches: router({
    list: publicProcedure.query(async () => {
      return await db.getAllMatches();
    }),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const match = await db.getMatchById(input.id);
        if (!match) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Match not found" });
        }
        
        // Get team stats
        const stats = await db.getTeamStatsByMatchId(input.id);
        const homeStats = stats.find(s => s.teamName === match.homeTeam);
        const awayStats = stats.find(s => s.teamName === match.awayTeam);
        
        return {
          ...match,
          homeTeamForm: homeStats?.lastFiveForm || null,
          awayTeamForm: awayStats?.lastFiveForm || null,
        };
      }),

    byWeek: publicProcedure
      .input(z.object({ week: z.number() }))
      .query(async ({ input }) => {
        return await db.getMatchesByWeek(input.week);
      }),

    byIdWithStats: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const match = await db.getMatchById(input.id);
        if (!match) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Match not found' });
        }
        
        // Get team stats for this match
        const stats = await db.getTeamStatsByMatchId(input.id);
        
        return { match, stats };
      }),

    create: adminProcedure
      .input(z.object({
        homeTeam: z.string(),
        awayTeam: z.string(),
        matchDate: z.date(),
        week: z.number(),
        day: z.string(),
        homeTeamForm: z.string().length(5).optional(),
        awayTeamForm: z.string().length(5).optional(),
      }))
      .mutation(async ({ input }) => {
        const match = await db.createMatch({
          homeTeam: input.homeTeam,
          awayTeam: input.awayTeam,
          matchDate: input.matchDate,
          week: input.week,
          day: input.day,
          isFinished: false,
        });

        // Create team stats if provided
        if (input.homeTeamForm) {
          await db.createTeamStat({
            matchId: match.id,
            teamName: input.homeTeam,
            lastFiveForm: input.homeTeamForm,
          });
        }

        if (input.awayTeamForm) {
          await db.createTeamStat({
            matchId: match.id,
            teamName: input.awayTeam,
            lastFiveForm: input.awayTeamForm,
          });
        }

        return match;
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        homeTeam: z.string().optional(),
        awayTeam: z.string().optional(),
        matchDate: z.date().optional(),
        week: z.number().optional(),
        day: z.string().optional(),
        homeScore: z.number().optional(),
        awayScore: z.number().optional(),
        isFinished: z.boolean().optional(),
        homeTeamForm: z.string().length(5).optional(),
        awayTeamForm: z.string().length(5).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, homeTeamForm, awayTeamForm, ...matchData } = input;
        
        const match = await db.updateMatch(id, matchData);
        
        // If match is marked as finished and has scores, calculate points
        if (input.isFinished && input.homeScore !== undefined && input.awayScore !== undefined) {
          await db.recalculateMatchScores(id);
        }

        // Update team stats if provided
        const existingStats = await db.getTeamStatsByMatchId(id);
        
        if (homeTeamForm && match) {
          const homeStat = existingStats.find(s => s.teamName === match.homeTeam);
          if (homeStat) {
            await db.updateTeamStat(homeStat.id, { lastFiveForm: homeTeamForm });
          } else {
            await db.createTeamStat({
              matchId: id,
              teamName: match.homeTeam,
              lastFiveForm: homeTeamForm,
            });
          }
        }

        if (awayTeamForm && match) {
          const awayStat = existingStats.find(s => s.teamName === match.awayTeam);
          if (awayStat) {
            await db.updateTeamStat(awayStat.id, { lastFiveForm: awayTeamForm });
          } else {
            await db.createTeamStat({
              matchId: id,
              teamName: match.awayTeam,
              lastFiveForm: awayTeamForm,
            });
          }
        }

        return match;
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteMatch(input.id);
        return { success: true };
      }),
  }),

  // Predictions (user)
  predictions: router({
    create: protectedProcedure
      .input(z.object({
        matchId: z.number(),
        predictedHomeScore: z.number().min(0),
        predictedAwayScore: z.number().min(0),
        predictedResult: z.enum(['home', 'draw', 'away']),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createPrediction({
          userId: ctx.user.id,
          matchId: input.matchId,
          predictedHomeScore: input.predictedHomeScore,
          predictedAwayScore: input.predictedAwayScore,
          predictedResult: input.predictedResult,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        predictedHomeScore: z.number().min(0),
        predictedAwayScore: z.number().min(0),
        predictedResult: z.enum(['home', 'draw', 'away']),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.updatePrediction(input.id, {
          predictedHomeScore: input.predictedHomeScore,
          predictedAwayScore: input.predictedAwayScore,
          predictedResult: input.predictedResult,
        });
      }),

    myPredictions: protectedProcedure.query(async ({ ctx }) => {
      return await db.getPredictionsByUserId(ctx.user.id);
    }),

    byUser: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const predictions = await db.getPredictionsByUserId(input.userId);
        // Get username for each prediction
        const user = await db.getUserById(input.userId);
        return predictions.map(p => ({
          ...p,
          username: user?.username || user?.name || `User #${input.userId}`,
        }));
      }),

    forMatch: protectedProcedure
      .input(z.object({ matchId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await db.getUserPredictionForMatch(ctx.user.id, input.matchId);
      }),

    // Admin can see all predictions
    allPredictions: adminProcedure.query(async () => {
      return await db.getAllPredictions();
    }),

    byMatch: adminProcedure
      .input(z.object({ matchId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPredictionsByMatchId(input.matchId);
      }),

    stats: publicProcedure
      .input(z.object({ matchId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPredictionStatsByMatchId(input.matchId);
      }),

    canPredict: protectedProcedure
      .input(z.object({ matchId: z.number() }))
      .query(async ({ input }) => {
        return await db.canMakePrediction(input.matchId);
      }),
  }),

  // Comments
  comments: router({
    list: publicProcedure
      .input(z.object({ matchId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCommentsByMatchId(input.matchId);
      }),

    create: protectedProcedure
      .input(z.object({
        matchId: z.number(),
        content: z.string().min(1).max(1000),
        parentId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createComment({
          userId: ctx.user.id,
          matchId: input.matchId,
          content: input.content,
          parentId: input.parentId,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // TODO: Add authorization check (user can only delete their own comments, or admin can delete any)
        await db.deleteComment(input.commentId);
        return { success: true };
      }),
  }),

  // Admin
  admin: router({    users: router({
      list: adminProcedure.query(async () => {
        return await db.getAllUsers();
      }),

      delete: adminProcedure
        .input(z.object({ userId: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteUser(input.userId);
          return { success: true };
        }),
    }),

    predictions: router({
      all: adminProcedure.query(async () => {
        return await db.getAllPredictionsWithUsernames();
      }),

      byMatch: adminProcedure
        .input(z.object({ matchId: z.number() }))
        .query(async ({ input }) => {
          return await db.getPredictionsByMatchIdWithUsernames(input.matchId);
        }),
    }),
  }),

  // Leaderboard
  leaderboard: router({
    list: publicProcedure.query(async () => {
      const scores = await db.getLeaderboard(100);
      
      // Get user details for each score
      const leaderboard = await Promise.all(
        scores.map(async (score) => {
          const user = await db.getUserById(score.userId);
          return {
            ...score,
            username: user?.username || user?.name || `User #${score.userId}`,
          };
        })
      );
      
      return leaderboard;
    }),

    myScore: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserScore(ctx.user.id);
    }),

    userScore: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserScore(input.userId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
