import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import CrashGame from "@/components/games/CrashGame";
import DiceGame from "@/components/games/DiceGame";
import MineFieldGame from "@/components/games/MineFieldGame";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [balance, setBalance] = useState(1000.00);
  const [activeGame, setActiveGame] = useState<"crash" | "dice" | "minefield">("crash");

  const handleLogin = () => {
    setIsAuthenticated(true);
    setShowAuthDialog(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur-lg bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-3xl font-bold text-glow-purple bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                MonFix
              </h1>
              
              <nav className="hidden md:flex items-center gap-6">
                <Button variant="ghost" className="text-foreground hover:text-primary transition-colors">
                  Игры
                </Button>
                <Button variant="ghost" className="text-foreground hover:text-primary transition-colors">
                  Турниры
                </Button>
                <Button variant="ghost" className="text-foreground hover:text-primary transition-colors">
                  Бонусы
                </Button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Card className="px-6 py-2 glow-purple border-primary/30 bg-card/50">
                    <div className="flex items-center gap-2">
                      <Icon name="Wallet" size={20} className="text-accent" />
                      <span className="font-bold text-lg">${balance.toFixed(2)}</span>
                    </div>
                  </Card>
                  <Button className="glow-green bg-accent hover:bg-accent/90">
                    <Icon name="Plus" size={18} className="mr-2" />
                    Пополнить
                  </Button>
                  <Button variant="outline" className="border-primary/30">
                    <Icon name="User" size={18} />
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setShowAuthDialog(true)}
                  className="glow-purple bg-primary hover:bg-primary/90"
                >
                  <Icon name="LogIn" size={18} className="mr-2" />
                  Войти
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          <aside className="space-y-4">
            <Card className="p-4 border-border/50 bg-card/50 backdrop-blur">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Icon name="Gamepad2" size={20} className="text-primary" />
                Игровые режимы
              </h3>
              
              <div className="space-y-2">
                <Button
                  onClick={() => setActiveGame("crash")}
                  variant={activeGame === "crash" ? "default" : "ghost"}
                  className={`w-full justify-start ${activeGame === "crash" ? "glow-purple bg-primary" : ""}`}
                >
                  <Icon name="TrendingUp" size={18} className="mr-2" />
                  Crash X
                </Button>
                
                <Button
                  onClick={() => setActiveGame("dice")}
                  variant={activeGame === "dice" ? "default" : "ghost"}
                  className={`w-full justify-start ${activeGame === "dice" ? "glow-blue bg-secondary" : ""}`}
                >
                  <Icon name="Dices" size={18} className="mr-2" />
                  Dice Rush
                </Button>
                
                <Button
                  onClick={() => setActiveGame("minefield")}
                  variant={activeGame === "minefield" ? "default" : "ghost"}
                  className={`w-full justify-start ${activeGame === "minefield" ? "glow-green bg-accent" : ""}`}
                >
                  <Icon name="Grid3x3" size={18} className="mr-2" />
                  MineField
                </Button>
              </div>
            </Card>

            <Card className="p-4 border-border/50 bg-card/50 backdrop-blur">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <Icon name="Clock" size={16} className="text-muted-foreground" />
                Последние выигрыши
              </h3>
              
              <div className="space-y-2 text-xs">
                {[
                  { user: "Player***", amount: 245.50, multi: "2.5x", game: "Crash" },
                  { user: "User***", amount: 890.00, multi: "8.9x", game: "Dice" },
                  { user: "Gamer***", amount: 156.20, multi: "1.6x", game: "Mine" },
                ].map((win, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <div>
                      <p className="font-medium">{win.user}</p>
                      <p className="text-muted-foreground">{win.game}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent">${win.amount}</p>
                      <p className="text-muted-foreground">{win.multi}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </aside>

          <div className="space-y-6">
            {activeGame === "crash" && <CrashGame balance={balance} setBalance={setBalance} />}
            {activeGame === "dice" && <DiceGame balance={balance} setBalance={setBalance} />}
            {activeGame === "minefield" && <MineFieldGame balance={balance} setBalance={setBalance} />}
          </div>
        </div>
      </main>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="border-border/50 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Добро пожаловать в MonFix</DialogTitle>
            <DialogDescription>
              Войдите или создайте новый аккаунт для начала игры
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
              <Button onClick={handleLogin} className="w-full glow-purple bg-primary hover:bg-primary/90">
                Войти
              </Button>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input id="reg-email" type="email" placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-username">Никнейм</Label>
                <Input id="reg-username" placeholder="Player123" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Пароль</Label>
                <Input id="reg-password" type="password" placeholder="••••••••" />
              </div>
              <Button onClick={handleLogin} className="w-full glow-purple bg-primary hover:bg-primary/90">
                Создать аккаунт
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
