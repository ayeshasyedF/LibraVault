from flask import Blueprint, jsonify, request
from services.loan_service import (
    borrow_book,
    return_loan,
    renew_loan,
    reserve_book,
    get_user_reservations,
    get_user_loans,
    get_open_loans,
    get_open_reservations,
)

loan_routes = Blueprint("loans", __name__)


def result_response(result, success_code=200):
    if "error" not in result:
        return jsonify(result), success_code

    message = result["error"].lower()

    if "not found" in message:
        return jsonify(result), 404

    if "already" in message or "no available copies" in message or "limit" in message:
        return jsonify(result), 409

    return jsonify(result), 400


@loan_routes.route("/borrow/<int:book_id>", methods=["POST"])
def borrow(book_id):
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")
    due_days = data.get("due_days", 14)

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    result = borrow_book(int(user_id), book_id, due_days)
    return result_response(result, 201)


@loan_routes.route("/return-loan/<int:loan_id>", methods=["POST"])
def return_loan_route(loan_id):
    result = return_loan(loan_id)
    return result_response(result)


@loan_routes.route("/renew/<int:loan_id>", methods=["POST"])
def renew(loan_id):
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    result = renew_loan(loan_id, int(user_id))
    return result_response(result)


@loan_routes.route("/reserve/<int:book_id>", methods=["POST"])
def reserve(book_id):
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    result = reserve_book(int(user_id), book_id)
    return result_response(result, 201)


@loan_routes.route("/users/<int:user_id>/reservations", methods=["GET"])
def user_reservations(user_id):
    return jsonify(get_user_reservations(user_id))


@loan_routes.route("/users/<int:user_id>/loans", methods=["GET"])
def user_loans(user_id):
    return jsonify(get_user_loans(user_id))


@loan_routes.route("/loans/open", methods=["GET"])
def open_loans():
    return jsonify(get_open_loans())

@loan_routes.route("/reservations/open", methods=["GET"])
def open_reservations():
    return jsonify(get_open_reservations())
