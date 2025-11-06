import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, LogOut } from "lucide-react";

export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<any>(null);

  // Form states
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [week, setWeek] = useState("");
  const [day, setDay] = useState("");
  const [homeTeamForm, setHomeTeamForm] = useState("");
  const [awayTeamForm, setAwayTeamForm] = useState("");
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");

  const utils = trpc.useUtils();
  const { data: matches, isLoading: matchesLoading } = trpc.matches.list.useQuery();

  const createMatchMutation = trpc.matches.create.useMutation({
    onSuccess: () => {
      toast.success("Maç başarıyla eklendi");
      utils.matches.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Maç eklenirken hata oluştu");
    },
  });

  const updateMatchMutation = trpc.matches.update.useMutation({
    onSuccess: () => {
      toast.success("Maç başarıyla güncellendi");
      utils.matches.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Maç güncellenirken hata oluştu");
    },
  });

  const deleteMatchMutation = trpc.matches.delete.useMutation({
    onSuccess: () => {
      toast.success("Maç başarıyla silindi");
      utils.matches.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Maç silinirken hata oluştu");
    },
  });

  const resetForm = () => {
    setHomeTeam("");
    setAwayTeam("");
    setMatchDate("");
    setWeek("");
    setDay("");
    setHomeTeamForm("");
    setAwayTeamForm("");
    setEditingMatch(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!homeTeam || !awayTeam || !matchDate || !week || !day) {
      toast.error("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    if (homeTeamForm && homeTeamForm.length !== 5) {
      toast.error("Ev sahibi form bilgisi 5 karakter olmalıdır (örn: GGBMG)");
      return;
    }

    if (awayTeamForm && awayTeamForm.length !== 5) {
      toast.error("Deplasman form bilgisi 5 karakter olmalıdır (örn: GGBMG)");
      return;
    }

    const matchData = {
      homeTeam,
      awayTeam,
      matchDate: new Date(matchDate),
      week: parseInt(week),
      day,
      homeTeamForm: homeTeamForm || undefined,
      awayTeamForm: awayTeamForm || undefined,
    };

    if (editingMatch) {
      updateMatchMutation.mutate({ id: editingMatch.id, ...matchData });
    } else {
      createMatchMutation.mutate(matchData);
    }
  };

  const handleEdit = (match: any) => {
    setEditingMatch(match);
    setHomeTeam(match.homeTeam);
    setAwayTeam(match.awayTeam);
    setMatchDate(new Date(match.matchDate).toISOString().slice(0, 16));
    setWeek(match.week.toString());
    setDay(match.day);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Bu maçı silmek istediğinizden emin misiniz?")) {
      deleteMatchMutation.mutate({ id });
    }
  };

  const handleScoreEntry = (match: any) => {
    setSelectedMatch(match);
    setHomeScore(match.homeScore?.toString() || "");
    setAwayScore(match.awayScore?.toString() || "");
    setScoreDialogOpen(true);
  };

  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!homeScore || !awayScore) {
      toast.error("Lütfen her iki takımın skorunu girin");
      return;
    }

    updateMatchMutation.mutate({
      id: selectedMatch.id,
      homeScore: parseInt(homeScore),
      awayScore: parseInt(awayScore),
      isFinished: true,
    }, {
      onSuccess: () => {
        setScoreDialogOpen(false);
        setSelectedMatch(null);
        setHomeScore("");
        setAwayScore("");
      }
    });
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
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
              Admin Paneli
            </h1>
            <p className="text-muted-foreground mt-1">Maç yönetimi ve düzenleme</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setLocation("/")}>Ana Sayfa</Button>
            <Button variant="outline" onClick={() => setLocation("/admin/predictions")}>Tüm Tahminler</Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Çıkış
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Maç Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingMatch ? "Maç Düzenle" : "Yeni Maç Ekle"}</DialogTitle>
                <DialogDescription>
                  Maç bilgilerini ve takım istatistiklerini girin
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="homeTeam">Ev Sahibi Takım *</Label>
                    <Input
                      id="homeTeam"
                      value={homeTeam}
                      onChange={(e) => setHomeTeam(e.target.value)}
                      placeholder="Manchester United"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="awayTeam">Deplasman Takım *</Label>
                    <Input
                      id="awayTeam"
                      value={awayTeam}
                      onChange={(e) => setAwayTeam(e.target.value)}
                      placeholder="Liverpool"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="week">Hafta *</Label>
                    <Input
                      id="week"
                      type="number"
                      value={week}
                      onChange={(e) => setWeek(e.target.value)}
                      placeholder="1"
                      min="1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="day">Gün *</Label>
                    <Select value={day} onValueChange={setDay} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Gün seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pazartesi">Pazartesi</SelectItem>
                        <SelectItem value="Salı">Salı</SelectItem>
                        <SelectItem value="Çarşamba">Çarşamba</SelectItem>
                        <SelectItem value="Perşembe">Perşembe</SelectItem>
                        <SelectItem value="Cuma">Cuma</SelectItem>
                        <SelectItem value="Cumartesi">Cumartesi</SelectItem>
                        <SelectItem value="Pazar">Pazar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="matchDate">Tarih ve Saat *</Label>
                    <Input
                      id="matchDate"
                      type="datetime-local"
                      value={matchDate}
                      onChange={(e) => setMatchDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="homeTeamForm">Ev Sahibi Son 5 Maç (G/B/M)</Label>
                    <Input
                      id="homeTeamForm"
                      value={homeTeamForm}
                      onChange={(e) => setHomeTeamForm(e.target.value.toUpperCase())}
                      placeholder="GGBMG"
                      maxLength={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      G: Galibiyet, B: Beraberlik, M: Mağlubiyet
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="awayTeamForm">Deplasman Son 5 Maç (G/B/M)</Label>
                    <Input
                      id="awayTeamForm"
                      value={awayTeamForm}
                      onChange={(e) => setAwayTeamForm(e.target.value.toUpperCase())}
                      placeholder="MGBGG"
                      maxLength={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      G: Galibiyet, B: Beraberlik, M: Mağlubiyet
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    disabled={createMatchMutation.isPending || updateMatchMutation.isPending}
                  >
                    {(createMatchMutation.isPending || updateMatchMutation.isPending) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : editingMatch ? (
                      "Güncelle"
                    ) : (
                      "Ekle"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsDialogOpen(false);
                    }}
                  >
                    İptal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {matchesLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : matches && matches.length > 0 ? (
          <div className="grid gap-4">
            {matches.map((match) => (
              <Card key={match.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span className="font-medium">Hafta {match.week}</span>
                        <span>•</span>
                        <span>{match.day}</span>
                        <span>•</span>
                        <span>{new Date(match.matchDate).toLocaleString("tr-TR")}</span>
                      </div>
                      <div className="text-lg font-semibold">
                        {match.homeTeam} vs {match.awayTeam}
                      </div>
                      {match.isFinished && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Sonuç: {match.homeScore} - {match.awayScore}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleScoreEntry(match)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {match.isFinished ? "Skoru Güncelle" : "Resmi Skor Gir"}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(match)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(match.id)}
                        disabled={deleteMatchMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Henüz maç eklenmemiş</p>
            </CardContent>
          </Card>
             )}

        {/* Score Entry Dialog */}
        <Dialog open={scoreDialogOpen} onOpenChange={setScoreDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resmi Skor Gir</DialogTitle>
              <DialogDescription>
                {selectedMatch && `${selectedMatch.homeTeam} vs ${selectedMatch.awayTeam}`}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleScoreSubmit} className="space-y-4">
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
              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={updateMatchMutation.isPending}
                >
                  {updateMatchMutation.isPending ? (
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
                  onClick={() => setScoreDialogOpen(false)}
                  disabled={updateMatchMutation.isPending}
                >
                  İptal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
