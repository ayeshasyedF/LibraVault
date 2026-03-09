import sqlite3
import pandas as pd

# File paths
csv_path = "Database/books.csv"
db_path = "library.db"

# Read CSV safely
df = pd.read_csv(csv_path, on_bad_lines="skip")

# Optional: clean column names
df.columns = [col.strip() for col in df.columns]

# Connect to SQLite
conn = sqlite3.connect(db_path)

# Replace the old imported table with a clean one
df.to_sql("ImportedBooks", conn, if_exists="replace", index=False)

# Quick verification
count = pd.read_sql_query("SELECT COUNT(*) AS count FROM ImportedBooks", conn)
print(count)

conn.close()
print("Import complete.")