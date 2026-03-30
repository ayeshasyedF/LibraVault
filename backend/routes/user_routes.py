from flask import Blueprint, jsonify
from database.db_connection import get_connection

user_routes = Blueprint("users", __name__)


def make_user_payload(user):
    role = (user["role"] or "reader").lower()
    user_id = int(user["user_id"])

    return {
        "user_id": user_id,
        "full_name": user["full_name"],
        "email": user["email"],
        "role": role,
        "member_id": f"NL-{100000 + user_id}" if role == "reader" else None,
        "staff_id": f"ADM-{user_id:03d}" if role == "admin" else None,
        "created_at": user["created_at"],
    }


@user_routes.route("/users/readers", methods=["GET"])
def list_readers():
    conn = get_connection()
    cursor = conn.cursor()

    rows = cursor.execute(
        """
        SELECT user_id, full_name, email, role, created_at
        FROM Users
        WHERE LOWER(COALESCE(role, 'reader')) = 'reader'
        ORDER BY full_name ASC, user_id ASC
        """
    ).fetchall()

    conn.close()
    return jsonify([make_user_payload(row) for row in rows])


@user_routes.route("/users/admins", methods=["GET"])
def list_admins():
    conn = get_connection()
    cursor = conn.cursor()

    rows = cursor.execute(
        """
        SELECT user_id, full_name, email, role, created_at
        FROM Users
        WHERE LOWER(COALESCE(role, 'reader')) = 'admin'
        ORDER BY full_name ASC, user_id ASC
        """
    ).fetchall()

    conn.close()
    return jsonify([make_user_payload(row) for row in rows])


@user_routes.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    conn = get_connection()
    cursor = conn.cursor()

    user = cursor.execute(
        """
        SELECT user_id, full_name, email, role, created_at
        FROM Users
        WHERE user_id = ?
        """,
        (user_id,)
    ).fetchone()

    if not user:
        conn.close()
        return jsonify({"error": "User not found"}), 404

    role = (user["role"] or "reader").lower()

    # If deleting a reader, clean up reservations and active loans first.
    if role == "reader":
        active_loans = cursor.execute(
            """
            SELECT loan_id, copy_id
            FROM Loans
            WHERE user_id = ? AND return_date IS NULL
            """,
            (user_id,)
        ).fetchall()

        for loan in active_loans:
            cursor.execute(
                "UPDATE Loans SET return_date = date('now') WHERE loan_id = ?",
                (loan["loan_id"],)
            )
            cursor.execute(
                "UPDATE BookCopies SET status = 'available' WHERE copy_id = ?",
                (loan["copy_id"],)
            )

        cursor.execute(
            "DELETE FROM Reservations WHERE user_id = ?",
            (user_id,)
        )

    # Prevent deleting the last admin
    if role == "admin":
        admin_count = cursor.execute(
            """
            SELECT COUNT(*) AS count
            FROM Users
            WHERE LOWER(COALESCE(role, 'reader')) = 'admin'
            """
        ).fetchone()["count"]

        if admin_count <= 1:
            conn.close()
            return jsonify({"error": "You cannot delete the last admin account"}), 409

    cursor.execute(
        "DELETE FROM Users WHERE user_id = ?",
        (user_id,)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "message": "User deleted successfully",
        "user_id": user_id,
        "role": role
    })
