from database.db_connection import get_connection

def get_all_books():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Fetch all books with their copies
    cursor.execute("SELECT * FROM Books")
    books = cursor.fetchall()

    all_books = []
    for b in books:
        book_id = b["book_id"]
        
        # Get copies for this book
        cursor.execute(
            "SELECT copy_id, status, location FROM BookCopies WHERE book_id=?",
            (book_id,)
        )
        copies = cursor.fetchall()
        copies_list = [dict(c) for c in copies] if copies else []

        book_dict = dict(b)
        book_dict["copies"] = copies_list
        all_books.append(book_dict)

    conn.close()
    return all_books

def get_book_by_id(book_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Books WHERE book_id=?", (book_id,))
    book = cursor.fetchone()
    if not book:
        conn.close()
        return None

    # Get copies for this book
    cursor.execute(
        "SELECT copy_id, status, location FROM BookCopies WHERE book_id=?",
        (book_id,)
    )
    copies = cursor.fetchall()
    book_dict = dict(book)
    book_dict["copies"] = [dict(c) for c in copies] if copies else []

    conn.close()
    return book_dict

def search_books(query):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Books WHERE title LIKE ?", (f"%{query}%",))
    books = cursor.fetchall()

    all_books = []
    for b in books:
        book_id = b["book_id"]
        cursor.execute(
            "SELECT copy_id, status, location FROM BookCopies WHERE book_id=?",
            (book_id,)
        )
        copies = cursor.fetchall()
        book_dict = dict(b)
        book_dict["copies"] = [dict(c) for c in copies] if copies else []
        all_books.append(book_dict)

    conn.close()
    return all_books