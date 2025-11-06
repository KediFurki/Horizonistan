import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Trophy, Star, Calendar } from "lucide-react";
import { Avatar } from "./Avatar";

export function WeeklyWinner() {
  const [selectedWeek, setSelectedWeek] = useState<string>("current");
  
  const { data: matches } = trpc.matches.list.useQuery();
  
  // Get all unique weeks
  const weeks = Array.from(new Set(matches?.map(m => m.week).filter(Boolean))).sort((a, b) => b - a);
  const currentWeek = weeks[0] || 1;
  
  const weekNumber = selectedWeek === "current" ? currentWeek : parseInt(selectedWeek);
  
  const { data: winner, isLoading } = trpc.leaderboard.weeklyWinner.useQuery(
    { week: weekNumber },
    { enabled: !!weekNumber }
  );

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 border-2 border-yellow-400 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400 rounded-full">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600 fill-yellow-600" />
                Haftanın Yıldızı
              </CardTitle>
              <CardDescription className="text-amber-700">
                En yüksek haftalık puan
              </CardDescription>
            </div>
          </div>
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="w-[160px] bg-white">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Bu Hafta</SelectItem>
              {weeks.map(week => (
                <SelectItem key={week} value={week.toString()}>
                  Hafta {week}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
          </div>
        ) : winner ? (
          <div className="flex items-center gap-6 bg-white rounded-lg p-6 shadow-md">
            <div className="relative">
              <Avatar 
                src={winner.profilePhoto} 
                alt={winner.username || "Kullanıcı"} 
                size="xl" 
              />
              <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1.5 shadow-lg">
                <Star className="h-4 w-4 text-white fill-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {winner.username || "Kullanıcı"}
              </h3>
              <div className="flex items-center gap-2 text-amber-700">
                <Trophy className="h-5 w-5" />
                <span className="text-lg font-semibold">
                  {winner.weeklyPoints} Puan
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Hafta {winner.week} Kazananı
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-amber-700">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Bu hafta henüz kazanan yok</p>
            <p className="text-sm mt-1">Maçlar tamamlandığında kazanan belirlenecek</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
