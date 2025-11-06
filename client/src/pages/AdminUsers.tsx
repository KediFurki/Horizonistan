import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Trash2, User, Calendar, TrendingUp } from "lucide-react";

export default function AdminUsers() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const utils = trpc.useUtils();
  const { data: users, isLoading: usersLoading } = trpc.admin.users.list.useQuery();

  const deleteUserMutation = trpc.admin.users.delete.useMutation({
    onSuccess: () => {
      toast.success("Kullanıcı başarıyla silindi");
      utils.admin.users.list.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Kullanıcı silinirken hata oluştu");
    },
  });

  const handleDelete = (userId: number, username: string) => {
    if (confirm(`"${username}" kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      deleteUserMutation.mutate({ userId });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Yetkisiz Erişim</CardTitle>
            <CardDescription>Bu sayfaya erişim yetkiniz yok</CardDescription>
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
                <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
                <p className="text-sm text-pink-100">Kayıtlı kullanıcıları görüntüle ve yönet</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              Tüm Kullanıcılar
            </CardTitle>
            <CardDescription>
              Toplam {users?.length || 0} kullanıcı kayıtlı
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : users && users.length > 0 ? (
              <div className="space-y-3">
                {users.map((u: any) => (
                  <div
                    key={u.id}
                    className="p-4 border rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                            {(u.username || u.name || "U")[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-lg">
                              {u.username || u.name || "İsimsiz Kullanıcı"}
                            </div>
                            {u.name && u.username && u.name !== u.username && (
                              <div className="text-sm text-muted-foreground">{u.name}</div>
                            )}
                          </div>
                          {u.role === "admin" && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Kayıt: {new Date(u.createdAt).toLocaleDateString("tr-TR")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            <span>Son Giriş: {new Date(u.lastSignedIn).toLocaleDateString("tr-TR")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {u.role !== "admin" && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(u.id, u.username || u.name || "Kullanıcı")}
                            disabled={deleteUserMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Henüz kayıtlı kullanıcı yok
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
