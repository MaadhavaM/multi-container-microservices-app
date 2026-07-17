from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import os
import time

app = Flask(__name__)
CORS(app)

def get_db():
    retries = 10
    while retries > 0:
        try:
            conn = mysql.connector.connect(
                host=os.environ.get("DB_HOST", "mysql"),
                user=os.environ.get("DB_USER", "root"),
                password=os.environ.get("DB_PASSWORD", "root123"),
                database=os.environ.get("DB_NAME", "microservicesdb")
            )
            return conn
        except:
            retries -= 1
            time.sleep(3)
    raise Exception("Cannot connect to database")

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(200) NOT NULL DEFAULT 'Untitled',
            content TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()

def serialize(n):
    return {
        'id': n['id'],
        'title': n['title'],
        'content': n['content'],
        'created_at': str(n['created_at']) if n['created_at'] else None,
        'updated_at': str(n['updated_at']) if n['updated_at'] else None,
    }

# GET all notes
@app.route("/notes", methods=["GET"])
def get_notes():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM notes ORDER BY updated_at DESC")
    notes = [serialize(n) for n in cursor.fetchall()]
    cursor.close()
    conn.close()
    return jsonify(notes)

# GET single note by id
@app.route("/notes/<int:note_id>", methods=["GET"])
def get_note(note_id):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM notes WHERE id=%s", (note_id,))
    note = cursor.fetchone()
    cursor.close()
    conn.close()
    if not note:
        return jsonify({"error": "Note not found"}), 404
    return jsonify(serialize(note))

# POST - create new note
@app.route("/notes", methods=["POST"])
def add_note():
    data = request.get_json()
    title = data.get("title", "Untitled")
    content = data.get("content", "")
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("INSERT INTO notes (title, content) VALUES (%s, %s)", (title, content))
    conn.commit()
    note_id = cursor.lastrowid
    cursor.execute("SELECT * FROM notes WHERE id=%s", (note_id,))
    note = cursor.fetchone()
    cursor.close()
    conn.close()
    return jsonify(serialize(note)), 201

# PUT - update note
@app.route("/notes/<int:note_id>", methods=["PUT"])
def update_note(note_id):
    data = request.get_json()
    title = data.get("title", "Untitled")
    content = data.get("content", "")
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("UPDATE notes SET title=%s, content=%s WHERE id=%s", (title, content, note_id))
    conn.commit()
    cursor.execute("SELECT * FROM notes WHERE id=%s", (note_id,))
    note = cursor.fetchone()
    cursor.close()
    conn.close()
    return jsonify(serialize(note))

# DELETE - delete note
@app.route("/notes/<int:note_id>", methods=["DELETE"])
def delete_note(note_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM notes WHERE id=%s", (note_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Note deleted", "id": note_id})

# Health check
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "Backend service running OK"})

if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000)