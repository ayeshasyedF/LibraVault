import os
from datetime import timedelta


class Config:
    DEBUG = True
    DATABASE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "library.db")

    SECRET_KEY = os.environ.get("SECRET_KEY", "change-this-in-env")
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = False  # switch to True in production with HTTPS
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
