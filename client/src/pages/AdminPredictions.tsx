import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, User, Trophy, Calendar } from "lucide-react";
import { getTeamLogo } from "@/lib/teamLogos";

export default function AdminPredictions() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedMatch, setSelectedMatch] = useState<number | "all">("all");
  const [selectedUser, setSelectedUser] = useState<number | "all">("all");
  const [selectedWeek, setSelectedWeek] = useState<number | "all">("all");

  const { data: allPredictions, isLoading: predictionsLoading } = trpc.admin.predictions.all.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: matches } = trpc.matches.list.useQuery();

  const getMatchInfo = (matchId: number) => {
    return matches?.find(m => m.id === matchId);
  };

  // Get unique users
  const uniqueUsers = allPredictions ? 
    Array.from(new Set(allPredictions.map((p: any) => JSON.stringify({ id: p.userId, name: p.username }))))
      .map(str => JSON.parse(str)) : [];

  // Get unique weeks
  const uniqueWeeks = matches ? 
    Array.from(new Set(matches.map((m: any) => m.week))).sort((a, b) => a - b) : [];

  // Filter by match, user and week
  const filteredPredictions = allPredictions?.filter((p: any) => {
    const match = getMatchInfo(p.matchId);
    const matchFilter = selectedMatch === "all" || p.matchId === selectedMatch;
    const userFilter = selectedUser === "all" || p.userId === selectedUser;
    const weekFilter = selectedWeek === "all" || (match && match.week === selectedWeek);
    return matchFilter && userFilter && weekFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Yetkisiz Erişim</CardTitle>
            <CardDescription>Bu sayfaya erişim yetkiniz bulunmamaktadır.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} className="w-full">
              Ana Sayfaya Dön
            </Button>
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
              <Button
                variant="ghost"
                onClick={() => setLocation("/admin")}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Geri
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Tahmin Detayları</h1>
                <p className="text-sm text-pink-100">Kullanıcıların tahminlerini görüntüle</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-8">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Match Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Maç Filtrele</CardTitle>
              <CardDescription>Belirli bir maçın tahminlerini gör</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedMatch.toString()} onValueChange={(value) => setSelectedMatch(value === "all" ? "all" : parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Maç seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Maçlar</SelectItem>
                  {matches?.map((match) => (
                    <SelectItem key={match.id} value={match.id.toString()}>
                      {match.homeTeam} vs {match.awayTeam} - Hafta {match.week}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* User Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Kullanıcı Filtrele</CardTitle>
              <CardDescription>Belirli bir kullanıcının tahminlerini gör</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedUser.toString()} onValueChange={(value) => setSelectedUser(value === "all" ? "all" : parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Kullanıcı seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kullanıcılar</SelectItem>
                  {uniqueUsers.map((u: any) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Week Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Hafta Filtrele</CardTitle>
              <CardDescription>Belirli bir haftanın tahminlerini gör</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(value === "all" ? "all" : parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Hafta seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Haftalar</SelectItem>
                  {uniqueWeeks.map((week: number) => (
                    <SelectItem key={week} value={week.toString()}>
                      Hafta {week}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Predictions List */}
        {predictionsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : filteredPredictions && filteredPredictions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPredictions.map((prediction: any) => {
              const match = getMatchInfo(prediction.matchId);
              if (!match) return null;

              return (
                <Card key={prediction.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                        {prediction.username[0].toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{prediction.username}</CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(prediction.createdAt).toLocaleDateString("tr-TR")}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    {/* Match Info */}
                    <div className="mb-4">
                      <div className="text-xs text-muted-foreground mb-2">
                        Hafta {match.week} • {match.day}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <img 
                            src={getTeamLogo(match.homeTeam)} 
                            alt={match.homeTeam}
                            className="h-8 w-8 object-contain"
                          />
                          <span className="text-sm font-medium truncate">{match.homeTeam}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">vs</span>
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="text-sm font-medium truncate">{match.awayTeam}</span>
                          <img 
                            src={getTeamLogo(match.awayTeam)} 
                            alt={match.awayTeam}
                            className="h-8 w-8 object-contain"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Prediction */}
                    <div className="space-y-2">
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Trophy className="h-4 w-4 text-purple-600" />
                          <span className="text-xs font-medium text-muted-foreground">Skor Tahmini</span>
                        </div>
                        <div className="text-center">
                          <span className="text-2xl font-bold text-purple-600">
                            {prediction.predictedHomeScore} - {prediction.predictedAwayScore}
                          </span>
                        </div>
                      </div>

                      <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-3 border border-pink-200 dark:border-pink-800">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <User className="h-4 w-4 text-pink-600" />
                          <span className="text-xs font-medium text-muted-foreground">Sonuç Tahmini</span>
                        </div>
                        <div className="text-center">
                          <span className="text-sm font-semibold text-pink-600">
                            {prediction.predictedResult === "home" ? `${match.homeTeam} Kazanır` : 
                             prediction.predictedResult === "draw" ? "Beraberlik" : 
                             `${match.awayTeam} Kazanır`}
                          </span>
                        </div>
                      </div>

                      {/* Official Result */}
                      {match.isFinished && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border-2 border-green-500 dark:border-green-700">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Trophy className="h-4 w-4 text-green-600" />
                            <span className="text-xs font-medium text-green-700 dark:text-green-400">Resmi Sonuç</span>
                          </div>
                          <div className="text-center space-y-1">
                            <div className="text-2xl font-bold text-green-600">
                              {match.homeScore} - {match.awayScore}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {(match.homeScore ?? 0) > (match.awayScore ?? 0) ? `${match.homeTeam} Kazanır` :
                               (match.homeScore ?? 0) < (match.awayScore ?? 0) ? `${match.awayTeam} Kazanır` :
                               "Beraberlik"}
                            </div>
                          </div>
                        </div>
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
              <p className="text-muted-foreground">
                {selectedMatch === "all" ? "Henüz tahmin yapılmamış" : "Bu maç için tahmin yapılmamış"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
