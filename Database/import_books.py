import sqlite3
import pandas as pd

csv_path = "books.csv"
db_path = "../library.db"

df = pd.read_csv(csv_path, on_bad_lines="skip")
df.columns = [col.strip() for col in df.columns]

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Clear existing data (optional but recommended for testing)
cursor.execute("DELETE FROM Books")
cursor.execute("DELETE FROM BookCopies")

# Insert into Books
for _, row in df.iterrows():
    cursor.execute("""
        INSERT INTO Books (title, isbn, author, category, publisher, publication_year, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        row.get("title"),
        row.get("isbn"),
        row.get("authors"),
        None,  # category (not in CSV)
        row.get("publisher"),
        None,  # publication_year (optional parse)
        None   # description
    ))

    book_id = cursor.lastrowid

    # Create copies (3 per book)
    for i in range(3):
        cursor.execute("""
            INSERT INTO BookCopies (book_id, status, location)
            VALUES (?, 'available', 'Main Library')
        """, (book_id,))

conn.commit()
conn.close()

print("Books and copies imported successfully.")