from flask import Blueprint, request
from flask_jwt_extended import create_access_token

from db import db
from models.business import Business
from models.user import User


auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth"
)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return {
            "error": "Request body is required"
        }, 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    business_name = data.get("business_name")

    if not name:
        return {
            "error": "Name is required"
        }, 400

    if not email:
        return {
            "error": "Email is required"
        }, 400

    if not password:
        return {
            "error": "Password is required"
        }, 400

    if not business_name:
        return {
            "error": "Business name is required"
        }, 400

    existing_user = User.query.filter_by(
        email=email
    ).first()

    if existing_user:
        return {
            "error": "A user with this email already exists"
        }, 409

    business = Business(
        name=business_name,
        business_type=data.get("business_type"),
        phone=data.get("business_phone"),
        email=data.get("business_email"),
        address=data.get("business_address"),
        currency=data.get("currency", "KES")
    )

    db.session.add(business)
    db.session.flush()

    user = User(
        business_id=business.id,
        name=name,
        email=email,
        role="owner"
    )

    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(
        identity=str(user.id)
    )

    return {
        "message": "Registration successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "business_id": user.business_id
        },
        "access_token": access_token
    }, 201