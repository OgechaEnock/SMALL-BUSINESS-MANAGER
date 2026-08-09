from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from db import db
from models.product import Product
from models.user import User


product_bp = Blueprint(
    "products",
    __name__,
    url_prefix="/api/products"
)


@product_bp.route("/", methods=["POST"])
@jwt_required()
def create_product():
    user_id = get_jwt_identity()

    user = User.query.get(int(user_id))

    if not user:
        return {
            "error": "User not found"
        }, 404

    data = request.get_json()

    if not data:
        return {
            "error": "Request body is required"
        }, 400

    name = data.get("name")

    if not name:
        return {
            "error": "Product name is required"
        }, 400

    product = Product(
        business_id=user.business_id,
        name=name,
        description=data.get("description"),
        sku=data.get("sku"),
        selling_price=data.get("selling_price", 0),
        cost_price=data.get("cost_price", 0),
        quantity=data.get("quantity", 0),
        low_stock_threshold=data.get(
            "low_stock_threshold",
            5
        )
    )

    db.session.add(product)
    db.session.commit()

    return {
        "message": "Product created successfully",
        "product": {
            "id": product.id,
            "business_id": product.business_id,
            "name": product.name,
            "description": product.description,
            "sku": product.sku,
            "selling_price": float(product.selling_price),
            "cost_price": float(product.cost_price),
            "quantity": product.quantity,
            "low_stock_threshold": product.low_stock_threshold
        }
    }, 201


@product_bp.route("/", methods=["GET"])
@jwt_required()
def get_products():
    user_id = get_jwt_identity()

    user = User.query.get(int(user_id))

    if not user:
        return {
            "error": "User not found"
        }, 404

    products = Product.query.filter_by(
        business_id=user.business_id
    ).order_by(
        Product.created_at.desc()
    ).all()

    return {
        "products": [
            {
                "id": product.id,
                "business_id": product.business_id,
                "name": product.name,
                "description": product.description,
                "sku": product.sku,
                "selling_price": float(product.selling_price),
                "cost_price": float(product.cost_price),
                "quantity": product.quantity,
                "low_stock_threshold": product.low_stock_threshold,
                "created_at": product.created_at.isoformat(),
                "updated_at": product.updated_at.isoformat()
            }
            for product in products
        ]
    }, 200
