from flask import Blueprint, jsonify, request
from backend.services.book_service import get_all_books, get_book_by_id, search_books

book_routes = Blueprint("books", __name__)

@book_routes.route("/books", methods=["GET"])
def books():
    books = get_all_books()
    return jsonify(books)

@book_routes.route("/books/<int:book_id>", methods=["GET"])
def book(book_id):
    book = get_book_by_id(book_id)
    if book:
        return jsonify(book)
    return jsonify({"error": "Book not found"}), 404

@book_routes.route("/search", methods=["GET"])
def search():
    query = request.args.get("q", "")
    results = search_books(query)
    return jsonify(results)