from flask import Blueprint, request, jsonify
from database import get_db
from utils import serialize

notes_bp = Blueprint('notes', __name__)

# GET all notes
@notes_bp.route("/notes", methods=["GET"])
def get_notes():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM notes ORDER BY updated_at DESC")
    notes = [serialize(n) for n in cursor.fetchall()]
    cursor.close()
    conn.close()
    return jsonify(notes)

# GET single note by id
@notes_bp.route("/notes/<int:note_id>", methods=["GET"])
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
@notes_bp.route("/notes", methods=["POST"])
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
@notes_bp.route("/notes/<int:note_id>", methods=["PUT"])
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
@notes_bp.route("/notes/<int:note_id>", methods=["DELETE"])
def delete_note(note_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM notes WHERE id=%s", (note_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Note deleted", "id": note_id})

# Health check
@notes_bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "Backend service running OK"})
