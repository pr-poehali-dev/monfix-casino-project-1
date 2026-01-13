CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    balance DECIMAL(12, 2) DEFAULT 1000.00,
    total_wagered DECIMAL(12, 2) DEFAULT 0.00,
    total_won DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    game_type VARCHAR(50) NOT NULL,
    bet_amount DECIMAL(10, 2) NOT NULL,
    multiplier DECIMAL(10, 2) NOT NULL,
    payout DECIMAL(10, 2) NOT NULL,
    is_win BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leaderboard (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    username VARCHAR(100) NOT NULL,
    total_wagered DECIMAL(12, 2) DEFAULT 0.00,
    total_won DECIMAL(12, 2) DEFAULT 0.00,
    biggest_win DECIMAL(12, 2) DEFAULT 0.00,
    games_played INTEGER DEFAULT 0,
    win_rate DECIMAL(5, 2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX idx_game_history_user_id ON game_history(user_id);
CREATE INDEX idx_game_history_created_at ON game_history(created_at DESC);
CREATE INDEX idx_leaderboard_total_won ON leaderboard(total_won DESC);
CREATE INDEX idx_leaderboard_biggest_win ON leaderboard(biggest_win DESC);