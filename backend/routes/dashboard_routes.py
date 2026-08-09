from datetime import datetime, time

from flask import Blueprint
from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required
)
from sqlalchemy import func

from db import db
from models.product import Product
from models.sale import Sale
from models.user import User


dashboard_bp = Blueprint(
    "dashboard",
    __name__,
    url_prefix="/api/dashboard"
)


@dashboard_bp.route("/", methods=["GET"])
@jwt_required()
def get_dashboard():
    user_id = get_jwt_identity()

    user = User.query.get(int(user_id))

    if not user:
        return {
            "error": "User not found"
        }, 404

    business_id = user.business_id

    # Today's date range
    today = datetime.utcnow().date()

    start_of_day = datetime.combine(
        today,
        time.min
    )

    end_of_day = datetime.combine(
        today,
        time.max
    )

    # Today's sales
    today_sales = Sale.query.filter(
        Sale.business_id == business_id,
        Sale.created_at >= start_of_day,
        Sale.created_at <= end_of_day
    ).all()

    today_revenue = sum(
        sale.total_amount
        for sale in today_sales
    )

    today_transactions = len(today_sales)

    # Total products
    total_products = Product.query.filter_by(
        business_id=business_id
    ).count()

    # Low-stock products
    low_stock_products = Product.query.filter(
        Product.business_id == business_id,
        Product.quantity <= Product.low_stock_threshold
    ).count()

    # Total inventory quantity
    total_inventory = db.session.query(
        func.coalesce(
            func.sum(Product.quantity),
            0
        )
    ).filter(
        Product.business_id == business_id
    ).scalar()

    # All-time revenue
    total_revenue = db.session.query(
        func.coalesce(
            func.sum(Sale.total_amount),
            0
        )
    ).filter(
        Sale.business_id == business_id
    ).scalar()

    # Recent sales
    recent_sales = Sale.query.filter_by(
        business_id=business_id
    ).order_by(
        Sale.created_at.desc()
    ).limit(5).all()

    return {
        "dashboard": {
            "today_revenue": float(
                today_revenue
            ),
            "today_transactions": today_transactions,
            "total_products": total_products,
            "low_stock_products": low_stock_products,
            "total_inventory": int(
                total_inventory
            ),
            "total_revenue": float(
                total_revenue
            ),
            "recent_sales": [
                {
                    "id": sale.id,
                    "product_name": sale.product.name,
                    "quantity": sale.quantity,
                    "unit_price": float(
                        sale.unit_price
                    ),
                    "total_amount": float(
                        sale.total_amount
                    ),
                    "created_at": sale.created_at.isoformat()
                }
                for sale in recent_sales
            ]
        }
    }, 200