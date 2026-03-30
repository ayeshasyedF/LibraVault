from database.db_connection import get_connection
from datetime import timedelta, date


def borrow_book(user_id, book_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT copy_id FROM BookCopies WHERE book_id=? AND status='available' LIMIT 1",
        (book_id,)
    )
    copy = cursor.fetchone()

    if not copy:
        conn.close()
        return {"error": "No available copies"}

    copy_id = copy["copy_id"]
    today = date.today()
    due = today + timedelta(days=14)

    cursor.execute(
        """
        INSERT INTO Loans (user_id, copy_id, borrow_date, due_date, renewal_count)
        VALUES (?, ?, ?, ?, ?)
        """,
        (user_id, copy_id, today, due, 0)
    )

    cursor.execute(
        "UPDATE BookCopies SET status='borrowed' WHERE copy_id=?",
        (copy_id,)
    )

    conn.commit()
    conn.close()

    return {
        "message": f"Borrowed copy {copy_id} of book {book_id}",
        "due_date": str(due)
    }


def return_book(user_id, book_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT l.loan_id, l.copy_id
        FROM Loans l
        JOIN BookCopies bc ON l.copy_id = bc.copy_id
        WHERE l.user_id=? AND bc.book_id=? AND bc.status='borrowed'
        """,
        (user_id, book_id)
    )
    loan = cursor.fetchone()

    if not loan:
        conn.close()
        return {"error": "No active loan found"}

    cursor.execute(
        "UPDATE BookCopies SET status='available' WHERE copy_id=?",
        (loan["copy_id"],)
    )
    cursor.execute(
        "DELETE FROM Loans WHERE loan_id=?",
        (loan["loan_id"],)
    )

    conn.commit()
    conn.close()

    return {"message": f"Returned copy {loan['copy_id']} of book {book_id}"}


def reserve_book(user_id, book_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT book_id FROM Books WHERE book_id=?",
        (book_id,)
    )
    book = cursor.fetchone()

    if not book:
        conn.close()
        return {"error": "Book not found"}

    cursor.execute(
        """
        SELECT reservation_id
        FROM Reservations
        WHERE user_id=? AND book_id=? AND status='active'
        """,
        (user_id, book_id)
    )
    existing = cursor.fetchone()

    if existing:
        conn.close()
        return {"error": "You already have an active reservation for this book"}

    today = date.today()

    cursor.execute(
        """
        INSERT INTO Reservations (user_id, book_id, reservation_date, status)
        VALUES (?, ?, ?, ?)
        """,
        (user_id, book_id, today, "active")
    )

    conn.commit()
    conn.close()

    return {"message": f"Book {book_id} reserved successfully"}


def get_user_reservations(user_id):
    conn = get_connection()
    cursor = conn.cursor()

    rows = cursor.execute(
        """
        SELECT reservation_id, user_id, book_id, reservation_date, status
        FROM Reservations
        WHERE user_id=? AND status='active'
        ORDER BY reservation_date DESC, reservation_id DESC
        """,
        (user_id,)
    ).fetchall()

    conn.close()
    return [dict(row) for row in rows]