from flask import Blueprint, jsonify

loan_routes = Blueprint("loans", __name__)

@loan_routes.route("/borrow/<int:book_id>", methods=["POST"])
def borrow_book(book_id):

    # later check availability and insert loan record

    return jsonify({
        "message": f"Borrow book with ID {book_id}"
    })


@loan_routes.route("/return/<int:book_id>", methods=["POST"])
def return_book(book_id):

    # later update loan record

    return jsonify({
        "message": f"Return book with ID {book_id}"
    })


@loan_routes.route("/reserve/<int:book_id>", methods=["POST"])
def reserve_book(book_id):

    # later create reservation record

    return jsonify({
        "message": f"Reserve book with ID {book_id}"
    })