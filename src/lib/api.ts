const API_URLS = {
  auth: 'https://functions.poehali.dev/c02ee02b-5c16-4838-9a6d-8915479e8e8c',
  game: 'https://functions.poehali.dev/956107d3-1351-4c6f-bb64-6d5908df0d59',
};

export interface User {
  id: number;
  username: string;
  balance: number;
}

export interface LeaderboardEntry {
  username: string;
  total_wagered: number;
  total_won: number;
  biggest_win: number;
  games_played: number;
  win_rate: number;
}

export const authAPI = {
  async register(email: string, username: string, password: string): Promise<User> {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', email, username, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Ошибка регистрации');
    return data.user;
  },

  async login(email: string, password: string): Promise<User> {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Ошибка входа');
    return data.user;
  },
};

export const gameAPI = {
  async getBalance(userId: number): Promise<number> {
    const response = await fetch(`${API_URLS.game}?user_id=${userId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.balance;
  },

  async placeBet(userId: number, betAmount: number): Promise<number> {
    const response = await fetch(API_URLS.game, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'place_bet', user_id: userId, bet_amount: betAmount }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Ошибка ставки');
    return data.balance;
  },

  async finishGame(
    userId: number,
    gameType: string,
    betAmount: number,
    multiplier: number,
    isWin: boolean
  ): Promise<{ balance: number; payout: number }> {
    const response = await fetch(API_URLS.game, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'finish_game',
        user_id: userId,
        game_type: gameType,
        bet_amount: betAmount,
        multiplier,
        is_win: isWin,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Ошибка завершения игры');
    return { balance: data.balance, payout: data.payout };
  },

  async getLeaderboard(sortBy: string = 'total_won', limit: number = 10): Promise<LeaderboardEntry[]> {
    const response = await fetch(`${API_URLS.game}?action=leaderboard&sort_by=${sortBy}&limit=${limit}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.leaders;
  },
};
