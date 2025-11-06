import { useState, useMemo } from "react";
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
import { Loader2, LogOut, Trophy, Calendar, Clock, TrendingUp, MessageSquare, BarChart3, AlertCircle, CheckCircle, XCircle, User } from "lucide-react";
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
  const [selectedWeek, setSelectedWeek] = useState<number>(11);
  const [resultsWeek, setResultsWeek] = useState<number | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [result, setResult] = useState<"home" | "draw" | "away">("home");

  const utils = trpc.useUtils();
  const { data: matches, isLoading: matchesLoading } = trpc.matches.list.useQuery();
  const { data: predictions } = trpc.predictions.myPredictions.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createPredictionMutation = trpc.predictions.create.useMutation({
    onSuccess: () => {
      toast.success("Tahmin başarıyla kaydedildi");
      utils.predictions.myPredictions.invalidate();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Tahmin kaydedilirken hata oluştu");
    },
  });

  const updatePredictionMutation = trpc.predictions.update.useMutation({
    onSuccess: () => {
      toast.success("Tahmin başarıyla güncellendi");
      utils.predictions.myPredictions.invalidate();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Tahmin güncellenirken hata oluştu");
    },
  });

  const resetForm = () => {
    setHomeScore("");
    setAwayScore("");
    setResult("home");
    setSelectedMatch(null);
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  const handlePredictClick = (match: any) => {
    const userPrediction = predictions?.find((p) => p.matchId === match.id);
    
    if (userPrediction) {
      setHomeScore(userPrediction.predictedHomeScore.toString());
      setAwayScore(userPrediction.predictedAwayScore.toString());
      setResult(userPrediction.predictedResult);
    } else {
      resetForm();
    }
    
    setSelectedMatch(match);
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!homeScore || !awayScore) {
      toast.error("Lütfen skorları girin");
      return;
    }

    const userPrediction = predictions?.find((p) => p.matchId === selectedMatch.id);

    if (userPrediction) {
      updatePredictionMutation.mutate({
        id: userPrediction.id,
        predictedHomeScore: parseInt(homeScore),
        predictedAwayScore: parseInt(awayScore),
        predictedResult: result,
      });
    } else {
      createPredictionMutation.mutate({
        matchId: selectedMatch.id,
        predictedHomeScore: parseInt(homeScore),
        predictedAwayScore: parseInt(awayScore),
        predictedResult: result,
      });
    }
  };

  // Filter matches by selected week
  const weekMatches = useMemo(() => {
    if (!matches) return [];
    return matches.filter((m) => m.week === selectedWeek);
  }, [matches, selectedWeek]);

  // Get finished matches for results table
  const finishedMatches = useMemo(() => {
    if (!matches) return [];
    return matches
      .filter((m) => m.isFinished && (resultsWeek === "all" || m.week === resultsWeek))
      .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());
  }, [matches, resultsWeek]);

  // Get available weeks
  const availableWeeks = useMemo(() => {
    if (!matches) return [];
    const weeks = Array.from(new Set(matches.map((m) => m.week))).sort((a, b) => a - b);
    return weeks;
  }, [matches]);

  // Check if user can predict (30 minutes before match)
  const canPredict = (matchDate: Date) => {
    const now = new Date();
    const match = new Date(matchDate);
    const diff = match.getTime() - now.getTime();
    const minutesUntilMatch = diff / (1000 * 60);
    return minutesUntilMatch > 30;
  };

  // Check if prediction is correct
  const isPredictionCorrect = (match: any, prediction: any) => {
    if (!match.isFinished || !prediction) return null;
    
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Giriş Yapın</CardTitle>
            <CardDescription>Tahmin yapmak için giriş yapmanız gerekiyor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={() => setLocation("/login")} className="flex-1">
                Giriş Yap
              </Button>
              <Button onClick={() => setLocation("/register")} variant="outline" className="flex-1">
                Kayıt Ol
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/Premier-League-Logo.png" 
                alt="Premier League" 
                className="h-12 w-12 object-contain bg-white rounded-lg p-1"
              />
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-100">
                  Horizonistan Fikstür Tahmini
                </h1>
                <p className="text-sm text-pink-100">Hoş geldin, {user?.name || user?.username}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/30 text-white" onClick={() => setLocation("/leaderboard")}>
                <Trophy className="h-4 w-4 mr-2" />
                Liderlik
              </Button>
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/30 text-white" onClick={() => setLocation("/profile/settings")}>
                <User className="h-4 w-4 mr-2" />
                Profil
              </Button>
              {user?.role === "admin" && (
                <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/30 text-white" onClick={() => setLocation("/admin")}>
                  Admin Paneli
                </Button>
              )}
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/30 text-white" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Predictions (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Week Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Hafta Seçin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {availableWeeks.map((week) => (
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
              </CardContent>
            </Card>

            {/* Matches List */}
            {matchesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : weekMatches.length > 0 ? (
              <div className="space-y-4">
                {weekMatches.map((match) => {
                  const userPrediction = predictions?.find((p) => p.matchId === match.id);
                  const matchCanPredict = canPredict(match.matchDate);
                  const predictionStatus = isPredictionCorrect(match, userPrediction);

                  return (
                    <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        {/* Match Info */}
                        <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{match.day}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(match.matchDate).toLocaleString("tr-TR")}</span>
                          </div>
                        </div>

                        {/* Teams */}
                        <div className="flex items-center justify-between mb-4">
                          {/* Home Team */}
                          <div className="flex-1 flex flex-col items-center gap-2">
                            <img 
                              src={getTeamLogo(match.homeTeam)} 
                              alt={match.homeTeam}
                              className="h-16 w-16 object-contain"
                            />
                            <span className="font-semibold text-center">{match.homeTeam}</span>
                            <FormDisplay form={match.homeTeamForm} />
                          </div>

                          {/* Score and VS */}
                          <div className="flex items-center gap-4">
                            {/* Home Score Prediction */}
                            {userPrediction && (
                              <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <span className="text-2xl font-bold text-purple-600">{userPrediction.predictedHomeScore}</span>
                              </div>
                            )}
                            
                            <div className="text-2xl font-bold text-muted-foreground">-</div>
                            
                            {/* Away Score Prediction */}
                            {userPrediction && (
                              <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <span className="text-2xl font-bold text-purple-600">{userPrediction.predictedAwayScore}</span>
                              </div>
                            )}
                          </div>

                          {/* Away Team */}
                          <div className="flex-1 flex flex-col items-center gap-2">
                            <img 
                              src={getTeamLogo(match.awayTeam)} 
                              alt={match.awayTeam}
                              className="h-16 w-16 object-contain"
                            />
                            <span className="font-semibold text-center">{match.awayTeam}</span>
                            <FormDisplay form={match.awayTeamForm} />
                          </div>
                        </div>

                        {/* Prediction Status */}
                        {match.isFinished && userPrediction && (
                          <div className={`mb-3 p-3 rounded-lg border-2 ${
                            predictionStatus === "exact" ? "bg-green-50 border-green-500 dark:bg-green-900/20" :
                            predictionStatus === "result" ? "bg-blue-50 border-blue-500 dark:bg-blue-900/20" :
                            "bg-red-50 border-red-500 dark:bg-red-900/20"
                          }`}>
                            <div className="flex items-center gap-2 text-sm font-medium">
                              {predictionStatus === "exact" ? (
                                <>
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                  <span className="text-green-700 dark:text-green-300">🎯 Tam İsabet! (+3 Puan)</span>
                                </>
                              ) : predictionStatus === "result" ? (
                                <>
                                  <CheckCircle className="h-5 w-5 text-blue-600" />
                                  <span className="text-blue-700 dark:text-blue-300">✅ Doğru Tahmin (+1 Puan)</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-5 w-5 text-red-600" />
                                  <span className="text-red-700 dark:text-red-300">❌ Tahmin Tutmadı</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* User Prediction - Result Only */}
                        {userPrediction && (
                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800 mb-3">
                            <div className="flex items-center justify-center gap-2 text-sm">
                              <TrendingUp className="h-4 w-4 text-purple-600" />
                              <span className="font-medium">Tahmininiz:</span>
                              <span className="font-bold text-purple-600">
                                {userPrediction.predictedResult === "home" ? match.homeTeam + " Kazanır" : 
                                  userPrediction.predictedResult === "draw" ? "Beraberlik" : match.awayTeam + " Kazanır"}
                              </span>
                            </div>
                          </div>
                        )}

                        {!matchCanPredict && !match.isFinished && (
                          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800 mb-3">
                            <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                              <AlertCircle className="h-4 w-4" />
                              <span>Maç başlangıcına 30 dakikadan az kaldı. Tahmin yapılamaz.</span>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {matchCanPredict && !match.isFinished && (
                            <Button
                              onClick={() => handlePredictClick(match)}
                              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                              {userPrediction ? "Tahmini Güncelle" : "Tahmin Yap"}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            onClick={() => setLocation(`/match/${match.id}`)}
                            className="flex gap-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Yorumlar
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setLocation(`/match/${match.id}`)}
                            className="flex gap-2"
                          >
                            <BarChart3 className="h-4 w-4" />
                            İstatistikler
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Bu hafta için maç bulunmuyor</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Official Results (1/3 width) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  ⚽ Resmi Sonuçlar
                </CardTitle>
                <CardDescription className="text-green-100 mb-3">
                  Tamamlanan maçlar
                </CardDescription>
                {/* Week Filter for Results */}
                <Select value={resultsWeek.toString()} onValueChange={(value) => setResultsWeek(value === "all" ? "all" : parseInt(value))}>
                  <SelectTrigger className="bg-white text-gray-900">
                    <SelectValue placeholder="Hafta seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Haftalar</SelectItem>
                    {availableWeeks.map((week) => (
                      <SelectItem key={week} value={week.toString()}>
                        Hafta {week}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {finishedMatches.length > 0 ? (
                  <div className="space-y-3">
                    {finishedMatches.map((match) => (
                      <div key={match.id} className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="text-xs text-muted-foreground mb-2">
                          Hafta {match.week} • {match.day}
                        </div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-1">
                            <img 
                              src={getTeamLogo(match.homeTeam)} 
                              alt={match.homeTeam}
                              className="h-6 w-6 object-contain"
                            />
                            <span className="text-sm font-medium truncate">{match.homeTeam}</span>
                          </div>
                          <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                            {match.homeScore}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <img 
                              src={getTeamLogo(match.awayTeam)} 
                              alt={match.awayTeam}
                              className="h-6 w-6 object-contain"
                            />
                            <span className="text-sm font-medium truncate">{match.awayTeam}</span>
                          </div>
                          <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                            {match.awayScore}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Henüz tamamlanan maç yok
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Prediction Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tahmin Yap</DialogTitle>
            <DialogDescription>
              {selectedMatch && `${selectedMatch.homeTeam} vs ${selectedMatch.awayTeam}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="homeScore">{selectedMatch?.homeTeam} Skoru</Label>
                <Input
                  id="homeScore"
                  type="number"
                  min="0"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
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
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="result">Maç Sonucu</Label>
              <Select value={result} onValueChange={(value: any) => setResult(value)} required>
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
                disabled={createPredictionMutation.isPending || updatePredictionMutation.isPending}
              >
                {(createPredictionMutation.isPending || updatePredictionMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  "Kaydet"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={createPredictionMutation.isPending || updatePredictionMutation.isPending}
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
