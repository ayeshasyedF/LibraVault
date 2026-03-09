from flask import Flask
# backend/app.py
from backend.config import Config

from backend.routes.book_routes import book_routes
from backend.routes.loan_routes import loan_routes
from backend.routes.auth_routes import auth_routes

app = Flask(__name__)
app.config.from_object(Config)

app.register_blueprint(book_routes)
app.register_blueprint(loan_routes)
app.register_blueprint(auth_routes)

@app.route("/")
def home():
    return {"message": "Library backend running"}

if __name__ == "__main__":
    app.run(debug=True)