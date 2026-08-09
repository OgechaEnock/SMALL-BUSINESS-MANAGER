from flask import Blueprint, request

from db import db
from models.business import Business


business_bp = Blueprint(
    "businesses",
    __name__,
    url_prefix="/api/businesses"
)


@business_bp.route("/", methods=["POST"])
def create_business():
    data = request.get_json()

    if not data:
        return {
            "error": "Request body is required"
        }, 400

    name = data.get("name")

    if not name:
        return {
            "error": "Business name is required"
        }, 400

    business = Business(
        name=name,
        business_type=data.get("business_type"),
        phone=data.get("phone"),
        email=data.get("email"),
        address=data.get("address"),
        currency=data.get("currency", "KES")
    )

    db.session.add(business)
    db.session.commit()

    return {
        "message": "Business created successfully",
        "business": {
            "id": business.id,
            "name": business.name,
            "business_type": business.business_type,
            "phone": business.phone,
            "email": business.email,
            "address": business.address,
            "currency": business.currency
        }
    }, 201