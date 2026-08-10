from flask import Blueprint, request
from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required
)

from db import db
from models.customer import Customer
from models.user import User


customer_bp = Blueprint(
    "customers",
    __name__,
    url_prefix="/api/customers"
)


@customer_bp.route("/", methods=["POST", "OPTIONS"])
@jwt_required(optional=True)
def create_customer():
    if request.method == "OPTIONS":
        return "", 200

    user_id = get_jwt_identity()

    if not user_id:
        return {
            "error": "Authentication required"
        }, 401

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
            "error": "Customer name is required"
        }, 400

    customer = Customer(
        business_id=user.business_id,
        name=name,
        phone=data.get("phone"),
        email=data.get("email"),
        address=data.get("address")
    )

    db.session.add(customer)
    db.session.commit()

    return {
        "message": "Customer created successfully",
        "customer": {
            "id": customer.id,
            "business_id": customer.business_id,
            "name": customer.name,
            "phone": customer.phone,
            "email": customer.email,
            "address": customer.address,
            "created_at": customer.created_at.isoformat(),
            "updated_at": customer.updated_at.isoformat()
        }
    }, 201


@customer_bp.route("/", methods=["GET", "OPTIONS"])
@jwt_required(optional=True)
def get_customers():
    if request.method == "OPTIONS":
        return "", 200

    user_id = get_jwt_identity()

    if not user_id:
        return {
            "error": "Authentication required"
        }, 401

    user = User.query.get(int(user_id))

    if not user:
        return {
            "error": "User not found"
        }, 404

    customers = Customer.query.filter_by(
        business_id=user.business_id
    ).order_by(
        Customer.created_at.desc()
    ).all()

    return {
        "customers": [
            {
                "id": customer.id,
                "business_id": customer.business_id,
                "name": customer.name,
                "phone": customer.phone,
                "email": customer.email,
                "address": customer.address,
                "created_at": customer.created_at.isoformat(),
                "updated_at": customer.updated_at.isoformat()
            }
            for customer in customers
        ]
    }, 200


@customer_bp.route(
    "/<int:customer_id>",
    methods=["GET", "OPTIONS"]
)
@jwt_required(optional=True)
def get_customer(customer_id):
    if request.method == "OPTIONS":
        return "", 200

    user_id = get_jwt_identity()

    if not user_id:
        return {
            "error": "Authentication required"
        }, 401

    user = User.query.get(int(user_id))

    if not user:
        return {
            "error": "User not found"
        }, 404

    customer = Customer.query.filter_by(
        id=customer_id,
        business_id=user.business_id
    ).first()

    if not customer:
        return {
            "error": "Customer not found"
        }, 404

    return {
        "customer": {
            "id": customer.id,
            "business_id": customer.business_id,
            "name": customer.name,
            "phone": customer.phone,
            "email": customer.email,
            "address": customer.address,
            "created_at": customer.created_at.isoformat(),
            "updated_at": customer.updated_at.isoformat()
        }
    }, 200


@customer_bp.route(
    "/<int:customer_id>",
    methods=["PUT", "OPTIONS"]
)
@jwt_required(optional=True)
def update_customer(customer_id):
    if request.method == "OPTIONS":
        return "", 200

    user_id = get_jwt_identity()

    if not user_id:
        return {
            "error": "Authentication required"
        }, 401

    user = User.query.get(int(user_id))

    if not user:
        return {
            "error": "User not found"
        }, 404

    customer = Customer.query.filter_by(
        id=customer_id,
        business_id=user.business_id
    ).first()

    if not customer:
        return {
            "error": "Customer not found"
        }, 404

    data = request.get_json()

    if not data:
        return {
            "error": "Request body is required"
        }, 400

    if "name" in data:
        if not data["name"]:
            return {
                "error": "Customer name cannot be empty"
            }, 400

        customer.name = data["name"]

    if "phone" in data:
        customer.phone = data["phone"]

    if "email" in data:
        customer.email = data["email"]

    if "address" in data:
        customer.address = data["address"]

    db.session.commit()

    return {
        "message": "Customer updated successfully",
        "customer": {
            "id": customer.id,
            "business_id": customer.business_id,
            "name": customer.name,
            "phone": customer.phone,
            "email": customer.email,
            "address": customer.address,
            "created_at": customer.created_at.isoformat(),
            "updated_at": customer.updated_at.isoformat()
        }
    }, 200


@customer_bp.route(
    "/<int:customer_id>",
    methods=["DELETE", "OPTIONS"]
)
@jwt_required(optional=True)
def delete_customer(customer_id):
    if request.method == "OPTIONS":
        return "", 200

    user_id = get_jwt_identity()

    if not user_id:
        return {
            "error": "Authentication required"
        }, 401

    user = User.query.get(int(user_id))

    if not user:
        return {
            "error": "User not found"
        }, 404

    customer = Customer.query.filter_by(
        id=customer_id,
        business_id=user.business_id
    ).first()

    if not customer:
        return {
            "error": "Customer not found"
        }, 404

    db.session.delete(customer)
    db.session.commit()

    return {
        "message": "Customer deleted successfully"
    }, 200
