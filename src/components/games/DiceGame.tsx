import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import Icon from "@/components/ui/icon";
import { gameAPI, type User } from "@/lib/api";
import { soundManager } from "@/lib/sounds";

interface DiceGameProps {
  user: User;
  setUser: (user: User) => void;
}

const DiceGame = ({ user, setUser }: DiceGameProps) => {
  const [betAmount, setBetAmount] = useState(10);
  const [chance, setChance] = useState(50);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [isWin, setIsWin] = useState<boolean | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const multiplier = (100 / chance * 0.98).toFixed(2);

  const rollDice = async () => {
    if (betAmount > user.balance || betAmount <= 0) return;

    setIsRolling(true);
    soundManager.play('bet');

    try {
      const newBalance = await gameAPI.placeBet(user.id, betAmount);
      setUser({ ...user, balance: newBalance });

      setTimeout(async () => {
        const roll = Math.floor(Math.random() * 100) + 1;
        const win = roll <= chance;

        setLastRoll(roll);
        setIsWin(win);
        setIsRolling(false);

        if (win) {
          soundManager.play('win');
          const result = await gameAPI.finishGame(user.id, 'dice', betAmount, parseFloat(multiplier), true);
          setUser({ ...user, balance: result.balance });
          toast.success(`Выигрыш: $${result.payout.toFixed(2)}`);
        } else {
          soundManager.play('lose');
          await gameAPI.finishGame(user.id, 'dice', betAmount, 0, false);
        }
      }, 500);
    } catch (error) {
      setIsRolling(false);
      toast.error(error instanceof Error ? error.message : 'Ошибка ставки');
    }
  };

  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Icon name="Dices" size={28} className="text-secondary" />
          Dice Rush
        </h2>
        <div className="text-sm text-muted-foreground">
          Мгновенные раунды
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div 
            className={`
              relative h-48 rounded-lg flex items-center justify-center
              ${isRolling ? 'bg-gradient-to-br from-secondary/20 to-primary/20 animate-pulse' : 'bg-muted/30'}
              ${isWin === true ? 'bg-accent/20' : ''}
              ${isWin === false ? 'bg-destructive/20' : ''}
              transition-all duration-300
            `}
          >
            {lastRoll !== null ? (
              <div className="text-center animate-scale-in">
                <div 
                  className={`
                    text-6xl font-bold
                    ${isWin ? 'text-accent' : 'text-destructive'}
                  `}
                >
                  {lastRoll}
                </div>
                <div className={`text-lg font-bold mt-2 ${isWin ? 'text-accent' : 'text-destructive'}`}>
                  {isWin ? 'ПОБЕДА!' : 'ПРОИГРЫШ'}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Icon name="Dices" size={64} className="mx-auto mb-2 opacity-50" />
                <p>Сделайте ставку</p>
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg bg-muted/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Шанс победы</span>
              <span className="font-bold text-lg text-secondary">{chance}%</span>
            </div>
            <Slider
              value={[chance]}
              onValueChange={(value) => setChance(value[0])}
              min={1}
              max={95}
              step={1}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1%</span>
              <span>95%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Множитель</label>
              <div className="h-10 rounded-md border border-input bg-muted/30 flex items-center justify-center">
                <span className="font-bold text-lg text-secondary">{multiplier}x</span>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Выигрыш</label>
              <div className="h-10 rounded-md border border-input bg-muted/30 flex items-center justify-center">
                <span className="font-bold text-lg text-accent">${(betAmount * parseFloat(multiplier)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Сумма ставки</label>
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              disabled={isRolling}
              className="text-lg font-bold"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={() => setBetAmount(Math.max(1, betAmount / 2))}
              disabled={isRolling}
            >
              1/2
            </Button>
            <Button
              variant="outline"
              onClick={() => setBetAmount(betAmount * 2)}
              disabled={isRolling}
            >
              2x
            </Button>
            <Button
              variant="outline"
              onClick={() => setBetAmount(Math.min(user.balance, betAmount * 3))}
              disabled={isRolling}
            >
              3x
            </Button>
          </div>

          <Button
            onClick={rollDice}
            disabled={betAmount > user.balance || betAmount <= 0 || isRolling}
            className="w-full h-14 text-lg font-bold glow-blue bg-secondary hover:bg-secondary/90"
          >
            <Icon name="Dices" size={20} className="mr-2" />
            {isRolling ? 'Бросок...' : 'Бросить кубик'}
          </Button>

          <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
            <h4 className="font-bold text-sm mb-3">Правила игры</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Выберите шанс победы (1-95%)</li>
              <li>• Чем ниже шанс — тем выше множитель</li>
              <li>• Выпадет число ≤ вашего шанса — вы побеждаете</li>
              <li>• Мгновенный результат каждого раунда</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DiceGame;