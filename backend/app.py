from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from config import Config
from db import db
from models import Business, User, Product
from routes.business_routes import business_bp
from flask_jwt_extended import JWTManager
from routes.auth_routes import auth_bp
from routes.product_routes import product_bp


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)
    JWTManager(app)
    db.init_app(app)
    Migrate(app, db)
    CORS(app)

    app.register_blueprint(business_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(product_bp)

    @app.route("/")
    def home():
        return {
            "message": "Small Business Manager API is running",
            "status": "success"
        }

    @app.route("/health")
    def health():
        return {
            "status": "healthy"
        }

    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )