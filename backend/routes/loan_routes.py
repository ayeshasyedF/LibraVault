from flask import Blueprint, jsonify, request
from services.loan_service import borrow_book, return_book, reserve_book

loan_routes = Blueprint("loans", __name__)

# Borrow
@loan_routes.route("/borrow/<int:book_id>", methods=["POST"])
def borrow(book_id):
    data = request.json
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    result = borrow_book(user_id, book_id)
    return jsonify(result)

# Return
@loan_routes.route("/return/<int:book_id>", methods=["POST"])
def return_book_route(book_id):
    data = request.json
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    result = return_book(user_id, book_id)
    return jsonify(result)

# Reserve
@loan_routes.route("/reserve/<int:book_id>", methods=["POST"])
def reserve(book_id):
    data = request.json
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    result = reserve_book(user_id, book_id)
    return jsonify(result)
