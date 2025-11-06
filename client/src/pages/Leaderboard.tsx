import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Trophy, Medal, Award } from "lucide-react";

export default function Leaderboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const { data: leaderboard, isLoading } = trpc.leaderboard.list.useQuery();
  const { data: myScore } = trpc.leaderboard.myScore.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500">1.</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400">2.</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600">3.</Badge>;
    return <Badge variant="outline">{rank}.</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950 dark:via-pink-950 dark:to-purple-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-purple-200 dark:border-purple-800 sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setLocation("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ana Sayfa
            </Button>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Liderlik Tablosu
              </h1>
              <p className="text-sm text-muted-foreground">En başarılı tahminler</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* My Score Card */}
        {isAuthenticated && myScore && (
          <Card className="mb-6 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-600" />
                Senin Skorun
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{myScore.totalPoints}</div>
                  <div className="text-sm text-muted-foreground">Toplam Puan</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{myScore.correctResults}</div>
                  <div className="text-sm text-muted-foreground">Doğru Sonuç</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{myScore.correctScores}</div>
                  <div className="text-sm text-muted-foreground">Tam İsabet</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-600">{myScore.totalPredictions}</div>
                  <div className="text-sm text-muted-foreground">Toplam Tahmin</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sıralama</CardTitle>
            <CardDescription>
              Puanlama: Sadece sonuç 1 puan, tam skor 3 puan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : leaderboard && leaderboard.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Sıra</TableHead>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead className="text-center">Toplam Puan</TableHead>
                    <TableHead className="text-center">Doğru Sonuç</TableHead>
                    <TableHead className="text-center">Tam İsabet</TableHead>
                    <TableHead className="text-center">Toplam Tahmin</TableHead>
                    <TableHead className="text-center">Başarı Oranı</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((entry, index) => {
                    const rank = index + 1;
                    const successRate = entry.totalPredictions > 0 
                      ? Math.round((entry.correctResults / entry.totalPredictions) * 100) 
                      : 0;
                    const isCurrentUser = user?.id === entry.userId;

                    return (
                      <TableRow 
                        key={entry.id}
                        className={isCurrentUser ? "bg-purple-50 dark:bg-purple-900/20 font-semibold" : ""}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRankIcon(rank)}
                            {getRankBadge(rank)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <Link href={`/user/${entry.userId}`}>
                            <span className="text-purple-600 dark:text-purple-400 hover:underline cursor-pointer">
                              {entry.username}
                            </span>
                          </Link>
                          {isCurrentUser && (
                            <Badge variant="outline" className="ml-2">Sen</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center font-bold text-purple-600">
                          {entry.totalPoints}
                        </TableCell>
                        <TableCell className="text-center text-green-600">
                          {entry.correctResults}
                        </TableCell>
                        <TableCell className="text-center text-blue-600">
                          {entry.correctScores}
                        </TableCell>
                        <TableCell className="text-center text-gray-600">
                          {entry.totalPredictions}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={successRate >= 70 ? "default" : successRate >= 50 ? "secondary" : "outline"}>
                            %{successRate}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Henüz kimse tahmin yapmamış</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Puanlama Sistemi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="font-medium">Sadece Sonuç Tahmini</span>
              <Badge className="bg-green-600">+1 Puan</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="font-medium">Tam Skor İsabeti</span>
              <Badge className="bg-blue-600">+3 Puan</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              * Sonuç tahmini: Hangi takımın kazanacağını veya berabere kalacağını doğru tahmin etmek
              <br />
              * Tam skor: Hem sonucu hem de tam skoru doğru tahmin etmek
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
