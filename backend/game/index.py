import json
import os
import psycopg2
from decimal import Decimal

def handler(event: dict, context) -> dict:
    '''API для игровых операций: ставки, обновление баланса, история'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            user_id = body.get('user_id')
            
            if action == 'place_bet':
                bet_amount = Decimal(str(body.get('bet_amount', 0)))
                
                cur.execute("SELECT balance FROM users WHERE id = %s", (user_id,))
                result = cur.fetchone()
                
                if not result:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Пользователь не найден'})
                    }
                
                balance = result[0]
                
                if balance < bet_amount:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Недостаточно средств'})
                    }
                
                new_balance = balance - bet_amount
                cur.execute("UPDATE users SET balance = %s WHERE id = %s", (new_balance, user_id))
                conn.commit()
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'balance': float(new_balance)})
                }
            
            elif action == 'finish_game':
                game_type = body.get('game_type')
                bet_amount = Decimal(str(body.get('bet_amount', 0)))
                multiplier = Decimal(str(body.get('multiplier', 0)))
                is_win = body.get('is_win', False)
                
                payout = bet_amount * multiplier if is_win else Decimal(0)
                
                cur.execute(
                    "INSERT INTO game_history (user_id, game_type, bet_amount, multiplier, payout, is_win) VALUES (%s, %s, %s, %s, %s, %s)",
                    (user_id, game_type, bet_amount, multiplier, payout, is_win)
                )
                
                cur.execute(
                    "UPDATE users SET balance = balance + %s, total_wagered = total_wagered + %s, total_won = total_won + %s WHERE id = %s",
                    (payout, bet_amount, payout, user_id)
                )
                
                cur.execute("SELECT balance FROM users WHERE id = %s", (user_id,))
                new_balance = cur.fetchone()[0]
                
                cur.execute(
                    "SELECT username, biggest_win FROM leaderboard WHERE user_id = %s",
                    (user_id,)
                )
                leaderboard_entry = cur.fetchone()
                
                if leaderboard_entry:
                    biggest_win = max(leaderboard_entry[1], payout)
                    
                    cur.execute(
                        "UPDATE leaderboard SET total_wagered = total_wagered + %s, total_won = total_won + %s, biggest_win = %s, games_played = games_played + 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = %s",
                        (bet_amount, payout, biggest_win, user_id)
                    )
                    
                    cur.execute(
                        "UPDATE leaderboard SET win_rate = CASE WHEN games_played > 0 THEN (SELECT COUNT(*)::decimal / games_played * 100 FROM game_history WHERE user_id = %s AND is_win = true) ELSE 0 END WHERE user_id = %s",
                        (user_id, user_id)
                    )
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'balance': float(new_balance), 'payout': float(payout)})
                }
            
            else:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неизвестное действие'})
                }
        
        elif method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            user_id = query_params.get('user_id')
            action = query_params.get('action')
            
            if action == 'leaderboard':
                sort_by = query_params.get('sort_by', 'total_won')
                limit = int(query_params.get('limit', 10))
                
                valid_sorts = ['total_won', 'total_wagered', 'biggest_win', 'win_rate', 'games_played']
                if sort_by not in valid_sorts:
                    sort_by = 'total_won'
                
                query = f"SELECT username, total_wagered, total_won, biggest_win, games_played, win_rate FROM leaderboard ORDER BY {sort_by} DESC LIMIT %s"
                cur.execute(query, (limit,))
                
                leaders = []
                for row in cur.fetchall():
                    leaders.append({
                        'username': row[0],
                        'total_wagered': float(row[1]),
                        'total_won': float(row[2]),
                        'biggest_win': float(row[3]),
                        'games_played': row[4],
                        'win_rate': float(row[5])
                    })
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'leaders': leaders})
                }
            
            elif user_id:
                cur.execute("SELECT balance FROM users WHERE id = %s", (user_id,))
                result = cur.fetchone()
                
                if result:
                    balance = float(result[0])
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'balance': balance})
                    }
            
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Пользователь не найден'})
            }
        
        else:
            cur.close()
            conn.close()
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }