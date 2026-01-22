import json
import os
import psycopg2
from datetime import datetime, date

def handler(event: dict, context) -> dict:
    '''API для получения и обновления данных пользователя'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    user_id = event.get('headers', {}).get('X-User-Id', '1')
    
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            cur.execute("""
                SELECT id, username, points, current_level, streak_days, last_active_date
                FROM users
                WHERE id = %s
            """, (user_id,))
            
            row = cur.fetchone()
            
            if not row:
                cur.execute("""
                    INSERT INTO users (id, username, points, current_level, streak_days)
                    VALUES (%s, %s, 0, 1, 0)
                    RETURNING id, username, points, current_level, streak_days, last_active_date
                """, (user_id, f'user_{user_id}'))
                conn.commit()
                row = cur.fetchone()
            
            cur.execute("""
                SELECT achievement_type, title, description, unlocked
                FROM achievements
                WHERE user_id = %s
            """, (user_id,))
            
            achievements = []
            for ach_row in cur.fetchall():
                achievements.append({
                    'type': ach_row[0],
                    'title': ach_row[1],
                    'description': ach_row[2],
                    'unlocked': ach_row[3]
                })
            
            if not achievements:
                default_achievements = [
                    ('first_steps', 'Первые шаги', 'Выполните первую задачу', 'Award'),
                    ('week_discipline', 'Неделя дисциплины', 'Выполните все задачи 7 дней подряд', 'Trophy'),
                    ('early_bird', 'Ранняя птица', 'Выполните утреннюю задачу до 8:00', 'Sunrise'),
                    ('time_master', 'Мастер времени', 'Выполните все задачи за день', 'Clock'),
                    ('marathon', 'Марафонец', 'Выполните задачи 30 дней подряд', 'Flame'),
                    ('legend', 'Легенда', 'Достигните 1000 баллов', 'Crown')
                ]
                
                for ach in default_achievements:
                    cur.execute("""
                        INSERT INTO achievements (user_id, achievement_type, title, description)
                        VALUES (%s, %s, %s, %s)
                    """, (user_id, ach[0], ach[1], ach[2]))
                    achievements.append({
                        'type': ach[0],
                        'title': ach[1],
                        'description': ach[2],
                        'unlocked': False
                    })
                
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'id': row[0],
                    'username': row[1],
                    'points': row[2],
                    'currentLevel': row[3],
                    'streakDays': row[4],
                    'lastActiveDate': str(row[5]) if row[5] else None,
                    'achievements': achievements
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            if 'initializeTasks' in body:
                tasks = body['initializeTasks']
                for task in tasks:
                    cur.execute("""
                        INSERT INTO tasks (user_id, title, time, points, category, notification_enabled)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        ON CONFLICT DO NOTHING
                    """, (
                        user_id,
                        task['title'],
                        task['time'],
                        task['points'],
                        task['category'],
                        task.get('notificationEnabled', True)
                    ))
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'User data updated'}),
                'isBase64Encoded': False
            }
        
    finally:
        cur.close()
        conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
