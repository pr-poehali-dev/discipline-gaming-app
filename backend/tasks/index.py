import json
import os
import psycopg2
from datetime import datetime, date

def handler(event: dict, context) -> dict:
    '''API для управления задачами пользователя'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
                SELECT id, title, time, points, category, completed, notification_enabled 
                FROM tasks 
                WHERE user_id = %s 
                ORDER BY time
            """, (user_id,))
            
            tasks = []
            for row in cur.fetchall():
                tasks.append({
                    'id': row[0],
                    'title': row[1],
                    'time': row[2],
                    'points': row[3],
                    'category': row[4],
                    'completed': row[5],
                    'notificationEnabled': row[6]
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'tasks': tasks}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cur.execute("""
                INSERT INTO tasks (user_id, title, time, points, category, notification_enabled)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                user_id,
                body['title'],
                body['time'],
                body['points'],
                body.get('category', 'Общее'),
                body.get('notificationEnabled', True)
            ))
            
            task_id = cur.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': task_id, 'message': 'Task created'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            task_id = body.get('id')
            
            if 'completed' in body:
                if body['completed']:
                    cur.execute("""
                        UPDATE tasks 
                        SET completed = true, completed_at = %s 
                        WHERE id = %s AND user_id = %s
                    """, (datetime.now(), task_id, user_id))
                    
                    cur.execute("SELECT points FROM tasks WHERE id = %s", (task_id,))
                    points = cur.fetchone()[0]
                    
                    cur.execute("""
                        UPDATE users 
                        SET points = points + %s 
                        WHERE id = %s
                    """, (points, user_id))
                else:
                    cur.execute("""
                        UPDATE tasks 
                        SET completed = false, completed_at = NULL 
                        WHERE id = %s AND user_id = %s
                    """, (task_id, user_id))
                    
                    cur.execute("SELECT points FROM tasks WHERE id = %s", (task_id,))
                    points = cur.fetchone()[0]
                    
                    cur.execute("""
                        UPDATE users 
                        SET points = GREATEST(0, points - %s)
                        WHERE id = %s
                    """, (points, user_id))
            else:
                cur.execute("""
                    UPDATE tasks 
                    SET title = %s, time = %s, points = %s, category = %s, notification_enabled = %s
                    WHERE id = %s AND user_id = %s
                """, (
                    body.get('title'),
                    body.get('time'),
                    body.get('points'),
                    body.get('category'),
                    body.get('notificationEnabled', True),
                    task_id,
                    user_id
                ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Task updated'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {})
            task_id = query_params.get('id')
            
            cur.execute("DELETE FROM tasks WHERE id = %s AND user_id = %s", (task_id, user_id))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Task deleted'}),
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
