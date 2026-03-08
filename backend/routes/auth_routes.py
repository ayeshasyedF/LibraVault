from flask import Blueprint, request, jsonify

auth_routes = Blueprint("auth", __name__)

@auth_routes.route("/register", methods=["POST"])
def register():

    data = request.json

    return jsonify({
        "message": "Register user",
        "username": data.get("username")
    })


@auth_routes.route("/login", methods=["POST"])
def login():

    data = request.json

    return jsonify({
        "message": "Login user",
        "username": data.get("username")
    })