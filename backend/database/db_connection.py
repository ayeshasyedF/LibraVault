import sqlite3
from backend.config import Config

def get_connection():
    conn = sqlite3.connect(Config.DATABASE)
    conn.row_factory = sqlite3.Row  # access columns by name
    return conn