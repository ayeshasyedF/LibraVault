from flask import Flask, jsonify, request
import sqlite3
import os

app = Flask(__name__)

# DB path
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "library.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route("/books", methods=["GET"])
def list_books():
    """List all books with their availability"""
    conn = get_db_connection()
    books = conn.execute("""
        SELECT b.book_id, b.title,
               COUNT(bc.copy_id) as total_copies,
               SUM(CASE WHEN bc.status='available' THEN 1 ELSE 0 END) as available_copies
        FROM Books b
        LEFT JOIN BookCopies bc ON b.book_id = bc.book_id
        GROUP BY b.book_id
    """).fetchall()
    conn.close()

    return jsonify([dict(book) for book in books])

@app.route("/borrow/<int:book_id>", methods=["POST"])
def borrow_book(book_id):
    """Borrow a book if available"""
    conn = get_db_connection()
    copy = conn.execute("""
        SELECT copy_id FROM BookCopies
        WHERE book_id = ? AND status = 'available'
        LIMIT 1
    """, (book_id,)).fetchone()

    if copy is None:
        conn.close()
        return jsonify({"error": "No copies available"}), 400

    # Mark as borrowed
    conn.execute("UPDATE BookCopies SET status = 'borrowed' WHERE copy_id = ?", (copy["copy_id"],))
    conn.commit()
    conn.close()

    return jsonify({"message": f"Book {book_id} borrowed successfully", "copy_id": copy["copy_id"]})

@app.route("/return/<int:copy_id>", methods=["POST"])
def return_book(copy_id):
    """Return a borrowed book"""
    conn = get_db_connection()
    conn.execute("UPDATE BookCopies SET status = 'available' WHERE copy_id = ?", (copy_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": f"Copy {copy_id} returned successfully"})

if __name__ == "__main__":
    app.run(debug=True)