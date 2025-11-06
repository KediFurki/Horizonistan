import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Loader2, LogOut, ArrowLeft } from "lucide-react";

export default function AdminPredictions() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: allPredictions, isLoading: predictionsLoading } = trpc.predictions.allPredictions.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: matches } = trpc.matches.list.useQuery();

  const getMatchInfo = (matchId: number) => {
    return matches?.find(m => m.id === matchId);
  };

  const getUserName = (userId: number) => {
    // This would ideally come from a separate query
    return `User ${userId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950 dark:via-pink-950 dark:to-purple-900">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Tüm Tahminler
            </h1>
            <p className="text-muted-foreground mt-1">Kullanıcıların yaptığı tahminleri görüntüleyin</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setLocation("/admin")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Admin Paneli
            </Button>
          </div>
        </div>

        {predictionsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : allPredictions && allPredictions.length > 0 ? (
          <Card>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Maç</TableHead>
                    <TableHead>Tahmin Edilen Skor</TableHead>
                    <TableHead>Tahmin Edilen Sonuç</TableHead>
                    <TableHead>Tarih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPredictions.map((prediction) => {
                    const match = getMatchInfo(prediction.matchId);
                    return (
                      <TableRow key={prediction.id}>
                        <TableCell>{getUserName(prediction.userId)}</TableCell>
                        <TableCell>
                          {match ? `${match.homeTeam} vs ${match.awayTeam}` : "Bilinmeyen Maç"}
                        </TableCell>
                        <TableCell>
                          {prediction.predictedHomeScore} - {prediction.predictedAwayScore}
                        </TableCell>
                        <TableCell>
                          {prediction.predictedResult === "home" ? "Ev Sahibi" : 
                           prediction.predictedResult === "draw" ? "Beraberlik" : "Deplasman"}
                        </TableCell>
                        <TableCell>
                          {new Date(prediction.createdAt).toLocaleString("tr-TR")}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Henüz tahmin yapılmamış</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
