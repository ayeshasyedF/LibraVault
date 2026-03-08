from flask import Blueprint, jsonify, request

book_routes = Blueprint("books", __name__)

@book_routes.route("/books", methods=["GET"])
def get_books():

    # later this will fetch books from the database

    return jsonify({
        "message": "Fetch all books from database"
    })


@book_routes.route("/books/<int:book_id>", methods=["GET"])
def get_book(book_id):

    # later query database for book

    return jsonify({
        "message": f"Fetch book {book_id} from database"
    })


@book_routes.route("/search", methods=["GET"])
def search_books():

    query = request.args.get("q")

    # later search database using query

    return jsonify({
        "message": f"Search books using keyword: {query}"
    })