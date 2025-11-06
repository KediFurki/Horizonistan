import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/Avatar";
import { Upload, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function ProfileSettings() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const utils = trpc.useUtils();
  const uploadMutation = trpc.auth.uploadProfilePhoto.useMutation({
    onSuccess: () => {
      toast.success("Profil fotoğrafı güncellendi!");
      utils.auth.me.invalidate();
    },
    onError: (error) => {
      toast.error("Hata: " + error.message);
      setUploading(false);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dosya boyutu 5MB'dan küçük olmalıdır");
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith("image/")) {
      toast.error("Sadece resim dosyaları yüklenebilir");
      return;
    }

    setUploading(true);

    try {
      // Dosyayı FormData olarak hazırla
      const formData = new FormData();
      formData.append('file', file);
      
      // S3'e yükle
      const response = await fetch('/api/upload-profile-photo', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const { url } = await response.json();
      
      // Veritabanına kaydet
      await uploadMutation.mutateAsync({ photoUrl: url });
      setUploading(false);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Fotoğraf yüklenirken bir hata oluştu");
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Giriş yapmanız gerekiyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ana Sayfa
              </Button>
              <h1 className="text-2xl font-bold">Profil Ayarları</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Profil Fotoğrafı</CardTitle>
            <CardDescription>
              Profil fotoğrafınızı yükleyin veya güncelleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Avatar */}
            <div className="flex flex-col items-center gap-4">
              <Avatar
                src={user.profilePhoto}
                alt={user.username || user.name || "User"}
                size="xl"
              />
              <div className="text-center">
                <p className="font-semibold text-lg">{user.username || user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex flex-col items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Fotoğraf Yükle
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500">
                Maksimum dosya boyutu: 5MB (JPG, PNG, GIF)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
