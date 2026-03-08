from flask import Flask
from config import Config

from routes.book_routes import book_routes
from routes.loan_routes import loan_routes
from routes.auth_routes import auth_routes

app = Flask(__name__)
app.config.from_object(Config)

# register routes
app.register_blueprint(book_routes)
app.register_blueprint(loan_routes)
app.register_blueprint(auth_routes)

@app.route("/")
def home():
    return {"message": "Library backend running"}

if __name__ == "__main__":
    app.run(debug=app.config["DEBUG"])