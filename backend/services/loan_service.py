from database.db_connection import get_connection
from datetime import datetime, timedelta, date

# Borrow a book
def borrow_book(user_id, book_id):
    conn = get_connection()
    cursor = conn.cursor()

    # Find an available copy
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

    # Insert into Loans
    cursor.execute(
        "INSERT INTO Loans (user_id, copy_id, borrow_date, due_date, renewal_count) VALUES (?, ?, ?, ?, ?)",
        (user_id, copy_id, today, due, 0)
    )

    # Update copy status
    cursor.execute("UPDATE BookCopies SET status='borrowed' WHERE copy_id=?", (copy_id,))
    conn.commit()
    conn.close()

    return {"message": f"Borrowed copy {copy_id} of book {book_id}", "due_date": str(due)}

# Return a book
def return_book(user_id, book_id):
    conn = get_connection()
    cursor = conn.cursor()

    # Find the loan
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

    # Update copy to available
    cursor.execute("UPDATE BookCopies SET status='available' WHERE copy_id=?", (loan["copy_id"],))
    # Remove loan record
    cursor.execute("DELETE FROM Loans WHERE loan_id=?", (loan["loan_id"],))
    conn.commit()
    conn.close()

    return {"message": f"Returned copy {loan['copy_id']} of book {book_id}"}

# Reserve a book
def reserve_book(user_id, book_id):
    conn = get_connection()
    cursor = conn.cursor()

    # Check if already reserved
    cursor.execute(
        "SELECT * FROM Reservations WHERE user_id=? AND book_id=? AND status='active'",
        (user_id, book_id)
    )
    if cursor.fetchone():
        conn.close()
        return {"error": "You already have an active reservation for this book"}

    today = date.today()
    cursor.execute(
        "INSERT INTO Reservations (user_id, book_id, reservation_date, status) VALUES (?, ?, ?, ?)",
        (user_id, book_id, today, "active")
    )
    conn.commit()
    conn.close()

    return {"message": f"Book {book_id} reserved successfully"}