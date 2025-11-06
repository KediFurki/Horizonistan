import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, ArrowLeft, MessageSquare, BarChart3, Send, Trash2 } from "lucide-react";
import { getTeamLogo } from "@/lib/teamLogos";
import { Progress } from "@/components/ui/progress";

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const matchId = parseInt(id || "0");
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"comments" | "stats">("comments");
  const [commentContent, setCommentContent] = useState("");

  const utils = trpc.useUtils();
  const { data: match, isLoading: matchLoading } = trpc.matches.byId.useQuery({ id: matchId });
  const { data: comments, isLoading: commentsLoading } = trpc.comments.list.useQuery({ matchId });
  const { data: stats, isLoading: statsLoading } = trpc.predictions.stats.useQuery({ matchId });

  const createCommentMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      toast.success("Yorum başarıyla eklendi");
      setCommentContent("");
      utils.comments.list.invalidate({ matchId });
    },
    onError: (error) => {
      toast.error(error.message || "Yorum eklenirken hata oluştu");
    },
  });

  const deleteCommentMutation = trpc.comments.delete.useMutation({
    onSuccess: () => {
      toast.success("Yorum silindi");
      utils.comments.list.invalidate({ matchId });
    },
    onError: (error) => {
      toast.error(error.message || "Yorum silinirken hata oluştu");
    },
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentContent.trim()) {
      toast.error("Yorum boş olamaz");
      return;
    }

    createCommentMutation.mutate({
      matchId,
      content: commentContent.trim(),
    });
  };

  const handleDeleteComment = (commentId: number) => {
    if (confirm("Bu yorumu silmek istediğinizden emin misiniz?")) {
      deleteCommentMutation.mutate({ commentId });
    }
  };

  // Check hash for initial tab
  useEffect(() => {
    if (window.location.hash === "#stats") {
      setActiveTab("stats");
    }
  }, []);

  if (matchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Maç bulunamadı</p>
            <Button onClick={() => setLocation("/")} className="mt-4">
              Ana Sayfaya Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950 dark:via-pink-950 dark:to-purple-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-purple-200 dark:border-purple-800 sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setLocation("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Maç Detayı
              </h1>
              <p className="text-sm text-muted-foreground">{match.day} - {new Date(match.matchDate).toLocaleString("tr-TR")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Match Info */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
              {/* Home Team */}
              <div className="flex flex-col items-end gap-2">
                <img 
                  src={getTeamLogo(match.homeTeam)} 
                  alt={match.homeTeam}
                  className="h-20 w-20 object-contain"
                />
                <div className="text-2xl font-bold text-right">{match.homeTeam}</div>
              </div>
              
              {/* Score/VS */}
              <div className="text-center px-6">
                {match.isFinished ? (
                  <div className="text-4xl font-bold text-purple-600">
                    {match.homeScore} - {match.awayScore}
                  </div>
                ) : (
                  <div className="text-2xl font-semibold text-muted-foreground">vs</div>
                )}
              </div>
              
              {/* Away Team */}
              <div className="flex flex-col items-start gap-2">
                <img 
                  src={getTeamLogo(match.awayTeam)} 
                  alt={match.awayTeam}
                  className="h-20 w-20 object-contain"
                />
                <div className="text-2xl font-bold text-left">{match.awayTeam}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "comments" ? "default" : "outline"}
            onClick={() => setActiveTab("comments")}
            className={activeTab === "comments" ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Yorumlar ({comments?.length || 0})
          </Button>
          <Button
            variant={activeTab === "stats" ? "default" : "outline"}
            onClick={() => setActiveTab("stats")}
            className={activeTab === "stats" ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            İstatistikler
          </Button>
        </div>

        {/* Comments Tab */}
        {activeTab === "comments" && (
          <div className="space-y-6">
            {/* Comment Form */}
            {isAuthenticated ? (
              <Card>
                <CardHeader>
                  <CardTitle>Yorum Yap</CardTitle>
                  <CardDescription>Maç hakkında düşüncelerinizi paylaşın</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                    <Textarea
                      placeholder="Yorumunuzu yazın..."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      rows={4}
                      maxLength={1000}
                      disabled={createCommentMutation.isPending}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {commentContent.length}/1000
                      </span>
                      <Button
                        type="submit"
                        disabled={createCommentMutation.isPending || !commentContent.trim()}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        {createCommentMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Gönderiliyor...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Gönder
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">Yorum yapmak için giriş yapmalısınız</p>
                  <Button onClick={() => setLocation("/login")}>
                    Giriş Yap
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Comments List */}
            {commentsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-semibold">{comment.username}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {new Date(comment.createdAt).toLocaleString("tr-TR")}
                          </span>
                        </div>
                        {(user?.id === comment.userId || user?.role === "admin") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={deleteCommentMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Henüz yorum yapılmamış</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            {statsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : stats && stats.total > 0 ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Tahmin İstatistikleri</CardTitle>
                    <CardDescription>Toplam {stats.total} tahmin yapıldı</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Result Predictions */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Maç Sonucu Tahminleri</h3>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>{match.homeTeam} Kazanır</span>
                          <span className="font-bold">{stats.homeWins} ({Math.round((stats.homeWins / stats.total) * 100)}%)</span>
                        </div>
                        <Progress value={(stats.homeWins / stats.total) * 100} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Beraberlik</span>
                          <span className="font-bold">{stats.draws} ({Math.round((stats.draws / stats.total) * 100)}%)</span>
                        </div>
                        <Progress value={(stats.draws / stats.total) * 100} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>{match.awayTeam} Kazanır</span>
                          <span className="font-bold">{stats.awayWins} ({Math.round((stats.awayWins / stats.total) * 100)}%)</span>
                        </div>
                        <Progress value={(stats.awayWins / stats.total) * 100} className="h-2" />
                      </div>
                    </div>

                    {/* Average Scores */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold">Ortalama Skor Tahminleri</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">{match.homeTeam}</div>
                          <div className="text-3xl font-bold text-purple-600">{stats.avgHomeScore}</div>
                        </div>
                        <div className="text-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">{match.awayTeam}</div>
                          <div className="text-3xl font-bold text-pink-600">{stats.avgAwayScore}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Henüz tahmin yapılmamış</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
