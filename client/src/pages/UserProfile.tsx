import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, User, Trophy, TrendingUp, CheckCircle, XCircle, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar } from "@/components/Avatar";
import { getTeamLogo } from "@/lib/teamLogos";

export default function UserProfile() {
  const { userId } = useParams();
  const { user: currentUser, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedWeek, setSelectedWeek] = useState<string>("all");

  const { data: userPredictions, isLoading: predictionsLoading } = trpc.predictions.byUser.useQuery(
    { userId: parseInt(userId!) },
    { enabled: !!userId }
  );

  const { data: userScore } = trpc.leaderboard.userScore.useQuery(
    { userId: parseInt(userId!) },
    { enabled: !!userId }
  );

  const { data: matches } = trpc.matches.list.useQuery();

  const getMatchInfo = (matchId: number) => {
    return matches?.find(m => m.id === matchId);
  };

  const isPredictionCorrect = (match: any, prediction: any) => {
    if (!match?.isFinished || !prediction) return null;
    
    const actualResult = 
      match.homeScore > match.awayScore ? "home" :
      match.homeScore < match.awayScore ? "away" : "draw";
    
    // Exact score
    if (prediction.predictedHomeScore === match.homeScore && 
        prediction.predictedAwayScore === match.awayScore) {
      return "exact";
    }
    
    // Correct result
    if (prediction.predictedResult === actualResult) {
      return "result";
    }
    
    return "wrong";
  };

  if (authLoading || predictionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const username = userPredictions?.[0]?.username || "Kullanıcı";
  const totalPredictions = userPredictions?.length || 0;
  const correctPredictions = userPredictions?.filter((p: any) => {
    const match = getMatchInfo(p.matchId);
    const status = isPredictionCorrect(match, p);
    return status === "exact" || status === "result";
  }).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/leaderboard")}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Geri
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Avatar src={userPredictions?.[0]?.profilePhoto} alt={username} size="lg" />
                  {username}
                </h1>
                <p className="text-purple-100">Kullanıcı Profili ve Tahmin Geçmişi</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Puan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{userScore?.totalPoints || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Tahmin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPredictions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Doğru Tahmin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{correctPredictions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Başarı Oranı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {totalPredictions > 0 ? Math.round((correctPredictions / totalPredictions) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Predictions History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tahmin Geçmişi</CardTitle>
                <CardDescription>Kullanıcının tüm tahminleri</CardDescription>
              </div>
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Hafta Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Haftalar</SelectItem>
                  {Array.from(new Set(userPredictions?.map((p: any) => {
                    const match = getMatchInfo(p.matchId);
                    return match?.week;
                  }).filter(Boolean))).sort((a: any, b: any) => a - b).map((week: any) => (
                    <SelectItem key={week} value={week.toString()}>Hafta {week}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {userPredictions && userPredictions.length > 0 ? (
              <div className="space-y-4">
                {userPredictions.filter((prediction: any) => {
                  if (selectedWeek === "all") return true;
                  const match = getMatchInfo(prediction.matchId);
                  return match?.week === parseInt(selectedWeek);
                }).map((prediction: any) => {
                  const match = getMatchInfo(prediction.matchId);
                  if (!match) return null;

                  const predictionStatus = isPredictionCorrect(match, prediction);

                  return (
                    <div
                      key={prediction.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-muted-foreground">
                          Hafta {match.week} • {match.day}
                        </div>
                        {match.isFinished && predictionStatus && (
                          <div className={`flex items-center gap-2 text-sm font-medium ${
                            predictionStatus === "exact" ? "text-green-600" :
                            predictionStatus === "result" ? "text-blue-600" :
                            "text-red-600"
                          }`}>
                            {predictionStatus === "exact" ? (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                Tam İsabet (+3 Puan)
                              </>
                            ) : predictionStatus === "result" ? (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                Doğru Tahmin (+1 Puan)
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4" />
                                Tahmin Tutmadı
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Match */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1 flex items-center gap-3">
                          <img 
                            src={getTeamLogo(match.homeTeam)} 
                            alt={match.homeTeam}
                            className="h-10 w-10 object-contain"
                          />
                          <span className="font-semibold">{match.homeTeam}</span>
                        </div>

                        <div className="px-4 text-muted-foreground">vs</div>

                        <div className="flex-1 flex items-center gap-3 justify-end">
                          <span className="font-semibold">{match.awayTeam}</span>
                          <img 
                            src={getTeamLogo(match.awayTeam)} 
                            alt={match.awayTeam}
                            className="h-10 w-10 object-contain"
                          />
                        </div>
                      </div>

                      {/* Prediction */}
                      <div className="mt-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">Tahmin:</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-purple-600">
                              {prediction.predictedHomeScore} - {prediction.predictedAwayScore}
                            </span>
                            <span className="text-muted-foreground">
                              ({prediction.predictedResult === "home" ? match.homeTeam + " Kazanır" : 
                                prediction.predictedResult === "draw" ? "Beraberlik" : match.awayTeam + " Kazanır"})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Official Score */}
                      {match.isFinished && (
                        <div className="mt-2 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-green-700 dark:text-green-400">Resmi Skor:</span>
                            <span className="font-bold text-green-700 dark:text-green-400">
                              {match.homeScore} - {match.awayScore}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Henüz tahmin yapılmamış
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
