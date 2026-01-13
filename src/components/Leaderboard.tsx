import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { gameAPI, type LeaderboardEntry } from "@/lib/api";

interface LeaderboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const Leaderboard = ({ open, onOpenChange }: LeaderboardProps) => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [sortBy, setSortBy] = useState<'total_won' | 'total_wagered' | 'biggest_win'>('total_won');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadLeaderboard();
    }
  }, [open, sortBy]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const data = await gameAPI.getLeaderboard(sortBy, 10);
      setLeaders(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}.`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border/50 bg-card/95 backdrop-blur-xl max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Icon name="Trophy" size={28} className="text-accent" />
            Таблица лидеров
          </DialogTitle>
        </DialogHeader>

        <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="total_won">
              <Icon name="DollarSign" size={16} className="mr-2" />
              Выигрыши
            </TabsTrigger>
            <TabsTrigger value="biggest_win">
              <Icon name="Zap" size={16} className="mr-2" />
              Рекорды
            </TabsTrigger>
            <TabsTrigger value="total_wagered">
              <Icon name="TrendingUp" size={16} className="mr-2" />
              Активность
            </TabsTrigger>
          </TabsList>

          <TabsContent value={sortBy} className="mt-6 space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Загрузка...
              </div>
            ) : leaders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Пока нет данных
              </div>
            ) : (
              leaders.map((leader, index) => (
                <Card
                  key={index}
                  className={`
                    p-4 border-border/50 bg-card/50 backdrop-blur animate-fade-in
                    ${index < 3 ? 'border-accent/30 glow-green' : ''}
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold w-12 text-center">
                        {getMedalIcon(index)}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{leader.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {leader.games_played} игр • {leader.win_rate.toFixed(1)}% побед
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {sortBy === 'total_won' && (
                        <>
                          <p className="font-bold text-xl text-accent">${leader.total_won.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Всего выиграно</p>
                        </>
                      )}
                      {sortBy === 'biggest_win' && (
                        <>
                          <p className="font-bold text-xl text-accent">${leader.biggest_win.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Лучший выигрыш</p>
                        </>
                      )}
                      {sortBy === 'total_wagered' && (
                        <>
                          <p className="font-bold text-xl text-secondary">${leader.total_wagered.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Всего поставлено</p>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default Leaderboard;
