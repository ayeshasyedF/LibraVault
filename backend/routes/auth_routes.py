from flask import Blueprint, request, jsonify
import sqlite3
from database.db_connection import get_connection
auth_routes = Blueprint("auth", __name__)

@auth_routes.route("/register", methods=["POST"])
def register():
    data = request.json
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO Users (full_name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, datetime('now'))",
        (data.get("full_name"), data.get("email"), data.get("password_hash"), data.get("role", "user"))
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "User registered", "email": data.get("email")})

@auth_routes.route("/login", methods=["POST"])
def login():
    data = request.json
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Users WHERE email=? AND password_hash=?", (data.get("email"), data.get("password_hash")))
    user = cursor.fetchone()
    conn.close()
    if user:
        return jsonify({"message": "Login successful", "user_id": user["user_id"]})
    return jsonify({"error": "Invalid credentials"}), 401