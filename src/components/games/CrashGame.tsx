import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";

interface CrashGameProps {
  balance: number;
  setBalance: (balance: number) => void;
}

const CrashGame = ({ balance, setBalance }: CrashGameProps) => {
  const [betAmount, setBetAmount] = useState(10);
  const [multiplier, setMultiplier] = useState(1.00);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBetPlaced, setIsBetPlaced] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [history, setHistory] = useState([2.45, 1.23, 8.90, 1.01, 3.56]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    if (betAmount > balance) return;
    
    setBalance(balance - betAmount);
    setIsPlaying(true);
    setIsBetPlaced(true);
    setCrashed(false);
    setCashedOut(false);
    setMultiplier(1.00);

    const crashPoint = Math.random() * 10 + 1;
    let current = 1.00;

    intervalRef.current = setInterval(() => {
      current += Math.random() * 0.1;
      setMultiplier(current);

      if (current >= crashPoint) {
        setCrashed(true);
        setIsPlaying(false);
        setIsBetPlaced(false);
        setHistory(prev => [parseFloat(current.toFixed(2)), ...prev.slice(0, 4)]);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 100);
  };

  const cashOut = () => {
    if (!isBetPlaced || crashed || cashedOut) return;
    
    const winAmount = betAmount * multiplier;
    setBalance(balance + winAmount);
    setCashedOut(true);
    setIsBetPlaced(false);
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    setTimeout(() => {
      setIsPlaying(false);
      setHistory(prev => [parseFloat(multiplier.toFixed(2)), ...prev.slice(0, 4)]);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Icon name="TrendingUp" size={28} className="text-primary" />
          Crash X
        </h2>
        <div className="text-sm text-muted-foreground">
          Выйдите до крэша!
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-4">
          <div 
            className={`
              relative h-64 rounded-lg flex items-center justify-center
              ${isPlaying ? 'bg-gradient-to-br from-primary/20 to-accent/20' : 'bg-muted/30'}
              ${crashed ? 'bg-destructive/20' : ''}
              ${cashedOut ? 'bg-accent/20' : ''}
              transition-all duration-300
            `}
          >
            <div className="text-center">
              <div 
                className={`
                  text-7xl font-bold
                  ${crashed ? 'text-destructive' : cashedOut ? 'text-accent' : 'text-primary'}
                  ${isPlaying && !crashed && !cashedOut ? 'animate-pulse-glow text-glow-purple' : ''}
                `}
              >
                {multiplier.toFixed(2)}x
              </div>
              {crashed && (
                <div className="text-destructive font-bold text-xl mt-2 animate-scale-in">
                  CRASHED!
                </div>
              )}
              {cashedOut && (
                <div className="text-accent font-bold text-xl mt-2 animate-scale-in">
                  CASHED OUT!
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-2 block">Ставка</label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={isBetPlaced}
                className="text-lg font-bold"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-2 block">Возможный выигрыш</label>
              <Input
                value={`$${(betAmount * multiplier).toFixed(2)}`}
                disabled
                className="text-lg font-bold text-accent"
              />
            </div>
          </div>

          {!isBetPlaced ? (
            <Button
              onClick={startGame}
              disabled={betAmount > balance || betAmount <= 0}
              className="w-full h-14 text-lg font-bold glow-purple bg-primary hover:bg-primary/90"
            >
              <Icon name="Play" size={20} className="mr-2" />
              Начать раунд
            </Button>
          ) : (
            <Button
              onClick={cashOut}
              disabled={crashed || cashedOut}
              className="w-full h-14 text-lg font-bold glow-green bg-accent hover:bg-accent/90"
            >
              <Icon name="DollarSign" size={20} className="mr-2" />
              Забрать выигрыш
            </Button>
          )}
        </div>

        <div>
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Icon name="History" size={18} className="text-muted-foreground" />
            История раундов
          </h3>
          <div className="space-y-2">
            {history.map((multi, i) => (
              <div
                key={i}
                className={`
                  p-3 rounded-lg font-bold text-center
                  ${multi >= 2 ? 'bg-accent/20 text-accent' : 'bg-destructive/20 text-destructive'}
                  ${i === 0 ? 'animate-scale-in' : ''}
                `}
              >
                {multi.toFixed(2)}x
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CrashGame;
