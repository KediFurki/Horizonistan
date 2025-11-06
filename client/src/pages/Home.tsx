import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, LogOut, Trophy, Calendar, Clock, TrendingUp, MessageSquare, BarChart3, AlertCircle } from "lucide-react";
import { getTeamLogo } from "@/lib/teamLogos";

// Form display component for team stats
function FormDisplay({ form }: { form: string | null }) {
  if (!form) return null;
  
  return (
    <div className="flex gap-1">
      {form.split("").map((char, idx) => {
        let bgColor = "bg-gray-400";
        let label = char;
        
        if (char === "G") {
          bgColor = "bg-green-500";
          label = "G";
        } else if (char === "B") {
          bgColor = "bg-yellow-500";
          label = "B";
        } else if (char === "M") {
          bgColor = "bg-red-500";
          label = "M";
        }
        
        return (
          <div
            key={idx}
            className={`w-7 h-7 ${bgColor} text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm`}
            title={char === "G" ? "Galibiyet" : char === "B" ? "Beraberlik" : "Mağlubiyet"}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [isPredictionDialogOpen, setIsPredictionDialogOpen] = useState(false);

  // Prediction form states
  const [predictedHomeScore, setPredictedHomeScore] = useState("");
  const [predictedAwayScore, setPredictedAwayScore] = useState("");
  const [predictedResult, setPredictedResult] = useState<"home" | "draw" | "away" | "">("");

  const utils = trpc.useUtils();
  const { data: allMatches, isLoading: matchesLoading } = trpc.matches.list.useQuery();
  const { data: myPredictions } = trpc.predictions.myPredictions.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createPredictionMutation = trpc.predictions.create.useMutation({
    onSuccess: () => {
      toast.success("Tahmin başarıyla kaydedildi");
      utils.predictions.myPredictions.invalidate();
      setIsPredictionDialogOpen(false);
      resetPredictionForm();
    },
    onError: (error) => {
      toast.error(error.message || "Tahmin kaydedilirken hata oluştu");
    },
  });

  const resetPredictionForm = () => {
    setPredictedHomeScore("");
    setPredictedAwayScore("");
    setPredictedResult("");
    setSelectedMatch(null);
  };

  // Get unique weeks
  const weeks = useMemo(() => {
    if (!allMatches) return [];
    const uniqueWeeks = Array.from(new Set(allMatches.map(m => m.week))).sort((a, b) => a - b);
    return uniqueWeeks;
  }, [allMatches]);

  // Filter matches by selected week
  const matches = useMemo(() => {
    if (!allMatches) return [];
    if (selectedWeek === null) return allMatches;
    return allMatches.filter(m => m.week === selectedWeek);
  }, [allMatches, selectedWeek]);

  // Set default week to first week
  useEffect(() => {
    if (weeks.length > 0 && selectedWeek === null) {
      setSelectedWeek(weeks[0]);
    }
  }, [weeks, selectedWeek]);

  const handlePredictionSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMatch) return;

    if (!predictedHomeScore || !predictedAwayScore || !predictedResult) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }

    createPredictionMutation.mutate({
      matchId: selectedMatch.id,
      predictedHomeScore: parseInt(predictedHomeScore),
      predictedAwayScore: parseInt(predictedAwayScore),
      predictedResult,
    });
  };

  const openPredictionDialog = (match: any) => {
    // Check if prediction time has passed (30 minutes before match)
    const matchDate = new Date(match.matchDate);
    const now = new Date();
    const thirtyMinutesBeforeMatch = new Date(matchDate.getTime() - 30 * 60 * 1000);
    
    if (now >= thirtyMinutesBeforeMatch) {
      toast.error("Maç başlangıcına 30 dakikadan az kaldı. Tahmin yapılamaz veya güncellenemez.");
      return;
    }
    
    setSelectedMatch(match);
    
    // Check if user already has a prediction for this match
    const existingPrediction = myPredictions?.find(p => p.matchId === match.id);
    if (existingPrediction) {
      setPredictedHomeScore(existingPrediction.predictedHomeScore.toString());
      setPredictedAwayScore(existingPrediction.predictedAwayScore.toString());
      setPredictedResult(existingPrediction.predictedResult);
    } else {
      resetPredictionForm();
      setSelectedMatch(match);
    }
    
    setIsPredictionDialogOpen(true);
  };

  const canMakePrediction = (match: any) => {
    if (match.isFinished) return false;
    
    const matchDate = new Date(match.matchDate);
    const now = new Date();
    const thirtyMinutesBeforeMatch = new Date(matchDate.getTime() - 30 * 60 * 1000);
    
    return now < thirtyMinutesBeforeMatch;
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/logos/Ana-sayfa-giriş.png" 
                alt="Horizonistan Logo" 
                className="h-32 w-auto object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Horizonistan Fikstür Tahmini
            </CardTitle>
            <CardDescription>
              Premier League maçları için tahminlerinizi yapın
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => setLocation("/login")}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Giriş Yap
            </Button>
            <Button
              onClick={() => setLocation("/register")}
              variant="outline"
              className="w-full"
            >
              Kayıt Ol
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
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src="/logos/Premier-League-Logo.png" 
                alt="Premier League" 
                className="h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Horizonistan Fikstür Tahmini
                </h1>
                <p className="text-sm text-muted-foreground">Hoş geldin, {user?.name || user?.username}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setLocation("/leaderboard")}>
                <Trophy className="h-4 w-4 mr-2" />
                Liderlik
              </Button>
              {user?.role === "admin" && (
                <Button variant="outline" onClick={() => setLocation("/admin")}>
                  Admin Paneli
                </Button>
              )}
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Week selector */}
        <div className="mb-6">
          <Label className="mb-2 block text-lg font-semibold">Hafta Seçin</Label>
          <div className="flex gap-2 flex-wrap">
            {weeks.map((week) => (
              <Button
                key={week}
                variant={selectedWeek === week ? "default" : "outline"}
                onClick={() => setSelectedWeek(week)}
                className={selectedWeek === week ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
              >
                Hafta {week}
              </Button>
            ))}
          </div>
        </div>

        {/* Matches */}
        {matchesLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : matches && matches.length > 0 ? (
          <div className="grid gap-4">
            {matches.map((match) => {
              const userPrediction = myPredictions?.find(p => p.matchId === match.id);
              const canPredict = canMakePrediction(match);
              
              return (
                <Card key={match.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">{match.day}</span>
                          <span>•</span>
                          <Clock className="h-4 w-4" />
                          <span>{new Date(match.matchDate).toLocaleString("tr-TR")}</span>
                        </div>

                        <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center mb-4">
                          {/* Home Team */}
                          <div className="flex flex-col items-end gap-2">
                            <img 
                              src={getTeamLogo(match.homeTeam)} 
                              alt={match.homeTeam}
                              className="h-16 w-16 object-contain"
                            />
                            <div className="text-lg font-bold text-right">{match.homeTeam}</div>
                            <FormDisplay form={match.homeTeamForm} />
                          </div>
                          
                          {/* Score/VS */}
                          <div className="text-center px-4">
                            {match.isFinished ? (
                              <div className="text-3xl font-bold text-purple-600">
                                {match.homeScore} - {match.awayScore}
                              </div>
                            ) : (
                              <div className="text-xl font-semibold text-muted-foreground">vs</div>
                            )}
                          </div>
                          
                          {/* Away Team */}
                          <div className="flex flex-col items-start gap-2">
                            <img 
                              src={getTeamLogo(match.awayTeam)} 
                              alt={match.awayTeam}
                              className="h-16 w-16 object-contain"
                            />
                            <div className="text-lg font-bold text-left">{match.awayTeam}</div>
                            <FormDisplay form={match.awayTeamForm} />
                          </div>
                        </div>

                        {match.isFinished && (
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border-2 border-green-500 dark:border-green-700 mb-3">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-green-700 dark:text-green-300">⚽ Resmi Skor:</span>
                              <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                                {match.homeScore} - {match.awayScore}
                              </span>
                            </div>
                          </div>
                        )}

                        {userPrediction && (
                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800 mb-3">
                            <div className="flex items-center gap-2 text-sm">
                              <TrendingUp className="h-4 w-4 text-purple-600" />
                              <span className="font-medium">Tahmininiz:</span>
                              <span className="font-bold text-purple-600">
                                {userPrediction.predictedHomeScore} - {userPrediction.predictedAwayScore}
                              </span>
                              <span className="text-muted-foreground">
                                ({userPrediction.predictedResult === "home" ? "Ev Sahibi Kazanır" : 
                                  userPrediction.predictedResult === "draw" ? "Beraberlik" : "Deplasman Kazanır"})
                              </span>
                            </div>
                          </div>
                        )}

                        {!canPredict && !match.isFinished && (
                          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800 mb-3">
                            <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                              <AlertCircle className="h-4 w-4" />
                              <span>Maç başlangıcına 30 dakikadan az kaldı. Tahmin yapılamaz.</span>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/match/${match.id}`)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Yorumlar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/match/${match.id}#stats`)}
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            İstatistikler
                          </Button>
                        </div>
                      </div>

                      {canPredict && (
                        <Button
                          onClick={() => openPredictionDialog(match)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          {userPrediction ? "Tahmini Güncelle" : "Tahmin Yap"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Bu hafta için henüz maç eklenmemiş</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Prediction Dialog */}
      <Dialog open={isPredictionDialogOpen} onOpenChange={(open) => {
        setIsPredictionDialogOpen(open);
        if (!open) resetPredictionForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tahmin Yap</DialogTitle>
            <DialogDescription>
              {selectedMatch?.homeTeam} vs {selectedMatch?.awayTeam}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePredictionSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="homeScore">{selectedMatch?.homeTeam} Skoru</Label>
                <Input
                  id="homeScore"
                  type="number"
                  min="0"
                  value={predictedHomeScore}
                  onChange={(e) => setPredictedHomeScore(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="awayScore">{selectedMatch?.awayTeam} Skoru</Label>
                <Input
                  id="awayScore"
                  type="number"
                  min="0"
                  value={predictedAwayScore}
                  onChange={(e) => setPredictedAwayScore(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="result">Maç Sonucu</Label>
              <Select value={predictedResult} onValueChange={(value: any) => setPredictedResult(value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Sonuç seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Ev Sahibi Kazanır</SelectItem>
                  <SelectItem value="draw">Beraberlik</SelectItem>
                  <SelectItem value="away">Deplasman Kazanır</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={createPredictionMutation.isPending}
              >
                {createPredictionMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  "Tahmini Kaydet"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetPredictionForm();
                  setIsPredictionDialogOpen(false);
                }}
              >
                İptal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
