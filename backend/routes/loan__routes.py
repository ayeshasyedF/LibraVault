from flask import Blueprint, jsonify, request
from services.loan_service import (
    borrow_book,
    return_book,
    reserve_book,
    get_user_reservations
)

loan_routes = Blueprint("loans", __name__)


def result_response(result, success_code=200):
    if "error" not in result:
        return jsonify(result), success_code

    message = result["error"].lower()

    if "already" in message or "no available copies" in message:
        return jsonify(result), 409

    if "not found" in message:
        return jsonify(result), 404

    return jsonify(result), 400


@loan_routes.route("/borrow/<int:book_id>", methods=["POST"])
def borrow(book_id):
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    result = borrow_book(user_id, book_id)
    return result_response(result, 201)


@loan_routes.route("/return/<int:book_id>", methods=["POST"])
def return_book_route(book_id):
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    result = return_book(user_id, book_id)
    return result_response(result)


@loan_routes.route("/reserve/<int:book_id>", methods=["POST"])
def reserve(book_id):
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    result = reserve_book(user_id, book_id)
    return result_response(result, 201)


@loan_routes.route("/users/<int:user_id>/reservations", methods=["GET"])
def user_reservations(user_id):
    reservations = get_user_reservations(user_id)
    return jsonify(reservations)