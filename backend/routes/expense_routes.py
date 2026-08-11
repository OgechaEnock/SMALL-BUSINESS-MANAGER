from datetime import date

from flask import Blueprint, request
from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required
)

from db import db
from models.expense import Expense
from models.user import User


expense_bp = Blueprint(
    "expenses",
    __name__,
    url_prefix="/api/expenses"
)


# ---------------------------------------------------------
# CREATE EXPENSE
# ---------------------------------------------------------

@expense_bp.route("/", methods=["POST"])
@jwt_required()
def create_expense():

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

    description = data.get("description")
    category = data.get("category")
    amount = data.get("amount")
    expense_date = data.get("expense_date")

    if not description:
        return {
            "error": "Description is required"
        }, 400

    if not category:
        return {
            "error": "Category is required"
        }, 400

    if amount is None:
        return {
            "error": "Amount is required"
        }, 400

    if not expense_date:
        return {
            "error": "Expense date is required"
        }, 400

    try:
        amount = float(amount)

        if amount <= 0:
            return {
                "error": "Amount must be greater than zero"
            }, 400

    except (TypeError, ValueError):
        return {
            "error": "Amount must be a valid number"
        }, 400

    try:
        parsed_date = date.fromisoformat(
            expense_date
        )

    except (TypeError, ValueError):
        return {
            "error": "Expense date must be in YYYY-MM-DD format"
        }, 400

    expense = Expense(
        business_id=user.business_id,
        user_id=user.id,
        description=description,
        category=category,
        amount=amount,
        expense_date=parsed_date,
        notes=data.get("notes")
    )

    db.session.add(expense)
    db.session.commit()

    return {
        "message": "Expense created successfully",
        "expense": {
            "id": expense.id,
            "business_id": expense.business_id,
            "user_id": expense.user_id,
            "description": expense.description,
            "category": expense.category,
            "amount": float(expense.amount),
            "expense_date": expense.expense_date.isoformat(),
            "notes": expense.notes,
            "created_at": expense.created_at.isoformat(),
            "updated_at": expense.updated_at.isoformat()
        }
    }, 201


# ---------------------------------------------------------
# GET ALL EXPENSES
# ---------------------------------------------------------

@expense_bp.route("/", methods=["GET"])
@jwt_required()
def get_expenses():

    user_id = get_jwt_identity()

    user = User.query.get(int(user_id))

    if not user:
        return {
            "error": "User not found"
        }, 404

    expenses = Expense.query.filter_by(
        business_id=user.business_id
    ).order_by(
        Expense.expense_date.desc(),
        Expense.created_at.desc()
    ).all()

    return {
        "expenses": [
            {
                "id": expense.id,
                "business_id": expense.business_id,
                "user_id": expense.user_id,
                "description": expense.description,
                "category": expense.category,
                "amount": float(expense.amount),
                "expense_date": expense.expense_date.isoformat(),
                "notes": expense.notes,
                "created_at": expense.created_at.isoformat(),
                "updated_at": expense.updated_at.isoformat()
            }
            for expense in expenses
        ]
    }, 200


# ---------------------------------------------------------
# GET SINGLE EXPENSE
# ---------------------------------------------------------

@expense_bp.route("/<int:expense_id>", methods=["GET"])
@jwt_required()
def get_expense(expense_id):

    user_id = get_jwt_identity()

    user = User.query.get(int(user_id))

    if not user:
        return {
            "error": "User not found"
        }, 404

    expense = Expense.query.filter_by(
        id=expense_id,
        business_id=user.business_id
    ).first()

    if not expense:
        return {
            "error": "Expense not found"
        }, 404

    return {
        "expense": {
            "id": expense.id,
            "business_id": expense.business_id,
            "user_id": expense.user_id,
            "description": expense.description,
            "category": expense.category,
            "amount": float(expense.amount),
            "expense_date": expense.expense_date.isoformat(),
            "notes": expense.notes,
            "created_at": expense.created_at.isoformat(),
            "updated_at": expense.updated_at.isoformat()
        }
    }, 200


# ---------------------------------------------------------
# UPDATE EXPENSE
# ---------------------------------------------------------

@expense_bp.route("/<int:expense_id>", methods=["PUT"])
@jwt_required()
def update_expense(expense_id):

    user_id = get_jwt_identity()

    user = User.query.get(int(user_id))

    if not user:
        return {
            "error": "User not found"
        }, 404

    expense = Expense.query.filter_by(
        id=expense_id,
        business_id=user.business_id
    ).first()

    if not expense:
        return {
            "error": "Expense not found"
        }, 404

    data = request.get_json()

    if not data:
        return {
            "error": "Request body is required"
        }, 400

    if "description" in data:

        if not data["description"]:
            return {
                "error": "Description cannot be empty"
            }, 400

        expense.description = data["description"]

    if "category" in data:

        if not data["category"]:
            return {
                "error": "Category cannot be empty"
            }, 400

        expense.category = data["category"]

    if "amount" in data:

        try:
            amount = float(data["amount"])

            if amount <= 0:
                return {
                    "error": "Amount must be greater than zero"
                }, 400

            expense.amount = amount

        except (TypeError, ValueError):

            return {
                "error": "Amount must be a valid number"
            }, 400

    if "expense_date" in data:

        try:
            expense.expense_date = date.fromisoformat(
                data["expense_date"]
            )

        except (TypeError, ValueError):

            return {
                "error": "Expense date must be in YYYY-MM-DD format"
            }, 400

    if "notes" in data:
        expense.notes = data["notes"]

    db.session.commit()

    return {
        "message": "Expense updated successfully",
        "expense": {
            "id": expense.id,
            "business_id": expense.business_id,
            "user_id": expense.user_id,
            "description": expense.description,
            "category": expense.category,
            "amount": float(expense.amount),
            "expense_date": expense.expense_date.isoformat(),
            "notes": expense.notes,
            "created_at": expense.created_at.isoformat(),
            "updated_at": expense.updated_at.isoformat()
        }
    }, 200


# ---------------------------------------------------------
# DELETE EXPENSE
# ---------------------------------------------------------

@expense_bp.route("/<int:expense_id>", methods=["DELETE"])
@jwt_required()
def delete_expense(expense_id):

    user_id = get_jwt_identity()

    user = User.query.get(int(user_id))

    if not user:
        return {
            "error": "User not found"
        }, 404

    expense = Expense.query.filter_by(
        id=expense_id,
        business_id=user.business_id
    ).first()

    if not expense:
        return {
            "error": "Expense not found"
        }, 404

    db.session.delete(expense)
    db.session.commit()

    return {
        "message": "Expense deleted successfully"
    }, 200