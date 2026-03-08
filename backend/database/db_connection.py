import sqlite3
from config import Config

def get_db_connection():
    conn = sqlite3.connect(Config.DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

    // change this ayesha based on what you use..
// sqlite3 is definitely easier than postgresql just a heads up
def get_db_connection():

# database connection will be implemented later

pass