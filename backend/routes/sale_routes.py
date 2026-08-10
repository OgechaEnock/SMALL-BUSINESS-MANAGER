from flask import Blueprint, request

from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required
)

from db import db
from models.product import Product
from models.sale import Sale
from models.user import User
from models.customer import Customer


sale_bp = Blueprint(
    "sales",
    __name__,
    url_prefix="/api/sales"
)


@sale_bp.route("/", methods=["POST"])
@jwt_required()
def create_sale():
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

    product_id = data.get("product_id")
    quantity = data.get("quantity")
    customer_id = data.get("customer_id")

    if not product_id:
        return {
            "error": "Product ID is required"
        }, 400

    if quantity is None:
        return {
            "error": "Quantity is required"
        }, 400

    try:
        product_id = int(product_id)
        quantity = int(quantity)

        if customer_id is not None:
            customer_id = int(customer_id)

    except (TypeError, ValueError):
        return {
            "error": "Product ID, customer ID and quantity must be valid numbers"
        }, 400

    if quantity <= 0:
        return {
            "error": "Quantity must be greater than zero"
        }, 400

    # Find product belonging to the user's business
    product = Product.query.filter_by(
        id=product_id,
        business_id=user.business_id
    ).first()

    if not product:
        return {
            "error": "Product not found"
        }, 404

    # Check stock
    if product.quantity < quantity:
        return {
            "error": "Insufficient stock",
            "available_quantity": product.quantity
        }, 400

    # Customer is optional
    customer = None

    if customer_id is not None:
        customer = Customer.query.filter_by(
            id=customer_id,
            business_id=user.business_id
        ).first()

        if not customer:
            return {
                "error": "Customer not found"
            }, 404

    # Calculate sale amount
    unit_price = product.selling_price
    total_amount = unit_price * quantity

    # Create sale
    sale = Sale(
        business_id=user.business_id,
        product_id=product.id,
        user_id=user.id,
        customer_id=customer.id if customer else None,
        quantity=quantity,
        unit_price=unit_price,
        total_amount=total_amount
    )

    # Reduce inventory
    product.quantity -= quantity

    db.session.add(sale)
    db.session.commit()

    return {
        "message": "Sale created successfully",
        "sale": {
            "id": sale.id,
            "product_id": sale.product_id,
            "product_name": product.name,

            "customer_id": sale.customer_id,
            "customer_name": (
                customer.name
                if customer
                else None
            ),

            "quantity": sale.quantity,

            "unit_price": float(
                sale.unit_price
            ),

            "total_amount": float(
                sale.total_amount
            ),

            "remaining_stock": product.quantity,

            "created_at": sale.created_at.isoformat()
        }
    }, 201


@sale_bp.route("/", methods=["GET"])
@jwt_required()
def get_sales():
    user_id = get_jwt_identity()

    user = User.query.get(int(user_id))

    if not user:
        return {
            "error": "User not found"
        }, 404

    sales = Sale.query.filter_by(
        business_id=user.business_id
    ).order_by(
        Sale.created_at.desc()
    ).all()

    return {
        "sales": [
            {
                "id": sale.id,

                "product_id": sale.product_id,

                "product_name": (
                    sale.product.name
                    if sale.product
                    else None
                ),

                "customer_id": sale.customer_id,

                "customer_name": (
                    sale.customer.name
                    if sale.customer
                    else None
                ),

                "quantity": sale.quantity,

                "unit_price": float(
                    sale.unit_price
                ),

                "total_amount": float(
                    sale.total_amount
                ),

                "created_at": (
                    sale.created_at.isoformat()
                )
            }
            for sale in sales
        ]
    }, 200