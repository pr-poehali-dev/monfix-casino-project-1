import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Icon from "@/components/ui/icon";
import { gameAPI, type User } from "@/lib/api";
import { soundManager } from "@/lib/sounds";

interface MineFieldGameProps {
  user: User;
  setUser: (user: User) => void;
}

const MineFieldGame = ({ user, setUser }: MineFieldGameProps) => {
  const [betAmount, setBetAmount] = useState(10);
  const [minesCount, setMinesCount] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [mines, setMines] = useState<Set<number>>(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);

  const gridSize = 25;
  const safeSpots = gridSize - minesCount;

  const calculateMultiplier = (revealedCount: number) => {
    if (revealedCount === 0) return 1.00;
    let multi = 1.00;
    for (let i = 0; i < revealedCount; i++) {
      multi *= (gridSize - i) / (safeSpots - i);
    }
    return multi * 0.96;
  };

  const startGame = async () => {
    if (betAmount > user.balance || betAmount <= 0) return;

    soundManager.play('bet');

    try {
      const newBalance = await gameAPI.placeBet(user.id, betAmount);
      setUser({ ...user, balance: newBalance });
    
      const newMines = new Set<number>();
      while (newMines.size < minesCount) {
        newMines.add(Math.floor(Math.random() * gridSize));
      }
      
      setMines(newMines);
      setRevealed(new Set());
      setIsPlaying(true);
      setGameOver(false);
      setCurrentMultiplier(1.00);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка ставки');
    }
  };

  const revealCell = async (index: number) => {
    if (!isPlaying || gameOver || revealed.has(index)) return;

    const newRevealed = new Set(revealed);
    newRevealed.add(index);
    setRevealed(newRevealed);

    if (mines.has(index)) {
      setGameOver(true);
      setIsPlaying(false);
      soundManager.play('lose');
      await gameAPI.finishGame(user.id, 'minefield', betAmount, currentMultiplier, false);
    } else {
      soundManager.play('click');
      const newMulti = calculateMultiplier(newRevealed.size);
      setCurrentMultiplier(newMulti);
    }
  };

  const cashOut = async () => {
    if (!isPlaying || gameOver || revealed.size === 0) return;

    soundManager.play('cashout');

    try {
      const result = await gameAPI.finishGame(user.id, 'minefield', betAmount, currentMultiplier, true);
      setUser({ ...user, balance: result.balance });
      toast.success(`Выигрыш: $${result.payout.toFixed(2)}`);
      setGameOver(true);
      setIsPlaying(false);
    } catch (error) {
      toast.error('Ошибка завершения игры');
    }
  };

  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Icon name="Grid3x3" size={28} className="text-accent" />
          MineField
        </h2>
        <div className="text-sm text-muted-foreground">
          Найдите безопасные ячейки!
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: gridSize }).map((_, i) => {
              const isRevealed = revealed.has(i);
              const isMine = mines.has(i) && (gameOver || !isPlaying);
              const isSafe = isRevealed && !mines.has(i);

              return (
                <button
                  key={i}
                  onClick={() => revealCell(i)}
                  disabled={!isPlaying || gameOver || isRevealed}
                  className={`
                    aspect-square rounded-lg font-bold text-lg transition-all
                    ${!isRevealed && isPlaying ? 'bg-muted hover:bg-muted/70 hover:scale-105 cursor-pointer' : ''}
                    ${!isRevealed && !isPlaying ? 'bg-muted/50' : ''}
                    ${isSafe ? 'bg-accent/20 border-2 border-accent animate-scale-in' : ''}
                    ${isMine ? 'bg-destructive/20 border-2 border-destructive animate-scale-in' : ''}
                  `}
                >
                  {isSafe && <Icon name="Gem" size={20} className="text-accent mx-auto" />}
                  {isMine && <Icon name="Bomb" size={20} className="text-destructive mx-auto" />}
                </button>
              );
            })}
          </div>

          {isPlaying && !gameOver && (
            <Button
              onClick={cashOut}
              disabled={revealed.size === 0}
              className="w-full h-14 text-lg font-bold glow-green bg-accent hover:bg-accent/90"
            >
              <Icon name="DollarSign" size={20} className="mr-2" />
              Забрать ${(betAmount * currentMultiplier).toFixed(2)}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div className={`
            p-4 rounded-lg text-center
            ${isPlaying ? 'bg-gradient-to-br from-accent/20 to-primary/20' : 'bg-muted/30'}
          `}>
            <div className="text-sm text-muted-foreground mb-1">Текущий множитель</div>
            <div className={`
              text-4xl font-bold
              ${isPlaying ? 'text-accent text-glow-green' : 'text-muted-foreground'}
            `}>
              {currentMultiplier.toFixed(2)}x
            </div>
            {isPlaying && (
              <div className="text-xs text-muted-foreground mt-2">
                Открыто: {revealed.size} / {safeSpots}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Количество мин</label>
            <Select
              value={minesCount.toString()}
              onValueChange={(v) => setMinesCount(Number(v))}
              disabled={isPlaying}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 мины (легко)</SelectItem>
                <SelectItem value="5">5 мин (средне)</SelectItem>
                <SelectItem value="8">8 мин (сложно)</SelectItem>
                <SelectItem value="12">12 мин (эксперт)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Сумма ставки</label>
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              disabled={isPlaying}
              className="text-lg font-bold"
            />
          </div>

          {!isPlaying ? (
            <Button
              onClick={startGame}
              disabled={betAmount > user.balance || betAmount <= 0}
              className="w-full h-14 text-lg font-bold glow-green bg-accent hover:bg-accent/90"
            >
              <Icon name="Play" size={20} className="mr-2" />
              Начать игру
            </Button>
          ) : gameOver && mines.has(Array.from(revealed)[revealed.size - 1]) ? (
            <div className="text-center p-4 bg-destructive/20 rounded-lg">
              <div className="text-destructive font-bold text-lg">Взрыв!</div>
              <div className="text-sm text-muted-foreground mt-1">Попробуйте еще раз</div>
            </div>
          ) : null}

          <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
            <h4 className="font-bold text-sm mb-3">Правила игры</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Выберите количество мин</li>
              <li>• Открывайте безопасные ячейки</li>
              <li>• Множитель растёт с каждой ячейкой</li>
              <li>• Заберите выигрыш до взрыва</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MineFieldGame;