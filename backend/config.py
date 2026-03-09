import os

class Config:
    DEBUG = True
    # Absolute path to the database file
    DATABASE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "library.db")
    SECRET_KEY = "library_secret"