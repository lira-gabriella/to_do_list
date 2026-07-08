from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel 
import sqlite3

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:3000"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

DB_FILE = "todo.db"

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row 
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS todos(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        is_completed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    conn.close()

init_db()

class TodoCreate(BaseModel):
    title: str



class TodoUpdate(BaseModel):
    title: str = None
    is_completed: int = None

@app.get("/api/todos")
def get_all_todos():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id , title , is_completed , datetime(created_at , 'localtime') as created_at FROM todos ORDER BY id DESC;")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/api/todos")
def create_todo(todo: TodoCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO todos (title , is_completed) VALUES(?,0)", (todo.title,))
    new_id = cursor.lastrowid
    conn.commit()
    cursor.execute("SELECT id, title, is_completed, datetime(created_at, 'localtime') as created_at FROM todos WHERE id = ?;", (new_id,))
    new_todo = cursor.fetchone()
    cursor.close()
    conn.close()
    return dict(new_todo)

@app.put("/api/todos/{todo_id}")
def update_todo(todo_id: int, todo: TodoUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    
    if todo.title is not None and todo.is_completed is not None:
        cursor.execute("UPDATE todos SET title = ?, is_completed = ? WHERE id = ?;", (todo.title, todo.is_completed, todo_id))
    elif todo.title is not None:
        cursor.execute("UPDATE todos SET title = ? WHERE id = ?;", (todo.title, todo_id))
    elif todo.is_completed is not None:
        cursor.execute("UPDATE todos SET is_completed = ? WHERE id = ?;", (todo.is_completed, todo_id))
        
   
    conn.commit()
    cursor.close()
    conn.close()
    return {"status": "success"}

@app.delete("/api/todos/{todo_id}")
def delete_todo(todo_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM todos WHERE id = ?;", (todo_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return {"status": "success"}
