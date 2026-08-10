from datetime import datetime, timedelta, time

from flask import Blueprint, request
from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required
)
from sqlalchemy import func

from db import db
from models.product import Product
from models.sale import Sale
from models.customer import Customer
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

    # --------------------------------
    # Today's date range
    # --------------------------------

    today = datetime.utcnow().date()

    start_of_day = datetime.combine(
        today,
        time.min
    )

    end_of_day = datetime.combine(
        today,
        time.max
    )

    # --------------------------------
    # Today's sales
    # --------------------------------

    today_sales = Sale.query.filter(
        Sale.business_id == business_id,
        Sale.created_at >= start_of_day,
        Sale.created_at <= end_of_day
    ).all()

    today_revenue = sum(
        sale.total_amount
        for sale in today_sales
    )

    today_transactions = len(
        today_sales
    )

    # --------------------------------
    # Total products
    # --------------------------------

    total_products = Product.query.filter_by(
        business_id=business_id
    ).count()

    # --------------------------------
    # Low-stock products
    # --------------------------------

    low_stock_products = Product.query.filter(
        Product.business_id == business_id,
        Product.quantity <= Product.low_stock_threshold
    ).count()

    # --------------------------------
    # Total inventory quantity
    # --------------------------------

    total_inventory = db.session.query(
        func.coalesce(
            func.sum(Product.quantity),
            0
        )
    ).filter(
        Product.business_id == business_id
    ).scalar()

    # --------------------------------
    # Total customers
    # --------------------------------

    total_customers = Customer.query.filter_by(
        business_id=business_id
    ).count()

    # --------------------------------
    # All-time revenue
    # --------------------------------

    total_revenue = db.session.query(
        func.coalesce(
            func.sum(Sale.total_amount),
            0
        )
    ).filter(
        Sale.business_id == business_id
    ).scalar()

    # --------------------------------
    # Recent sales
    # --------------------------------

    recent_sales = Sale.query.filter_by(
        business_id=business_id
    ).order_by(
        Sale.created_at.desc()
    ).limit(5).all()

    # --------------------------------
    # Response
    # --------------------------------

    return {
        "dashboard": {
            "today_revenue": float(
                today_revenue
            ),

            "today_transactions": (
                today_transactions
            ),

            "total_products": (
                total_products
            ),

            "low_stock_products": (
                low_stock_products
            ),

            "total_inventory": int(
                total_inventory
            ),

            "total_customers": (
                total_customers
            ),

            "total_revenue": float(
                total_revenue
            ),

            "recent_sales": [
                {
                    "id": sale.id,

                    "product_name": (
                        sale.product.name
                        if sale.product
                        else None
                    ),

                    "customer_name": (
                        sale.customer.name
                        if sale.customer
                        else "Walk-in Customer"
                    ),

                    "quantity": (
                        sale.quantity
                    ),

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

                for sale in recent_sales
            ]
        }
    }, 200

@dashboard_bp.route("/analytics", methods=["GET"])
@jwt_required()
def get_sales_analytics():
    user_id = get_jwt_identity()

    user = User.query.get(int(user_id))

    if not user:
        return {
            "error": "User not found"
        }, 404

    business_id = user.business_id

    # -----------------------------
    # Number of days
    # -----------------------------

    days = request.args.get(
        "days",
        default=7,
        type=int
    )

    if days not in [7, 30]:
        return {
            "error": "Days must be either 7 or 30"
        }, 400

    # -----------------------------
    # Date range
    # -----------------------------

    today = datetime.utcnow().date()

    start_date = today - timedelta(
        days=days - 1
    )

    start_datetime = datetime.combine(
        start_date,
        time.min
    )

    end_datetime = datetime.combine(
        today,
        time.max
    )

    # -----------------------------
    # Sales in selected period
    # -----------------------------

    sales = Sale.query.filter(
        Sale.business_id == business_id,
        Sale.created_at >= start_datetime,
        Sale.created_at <= end_datetime
    ).order_by(
        Sale.created_at.asc()
    ).all()

    # -----------------------------
    # Daily analytics
    # -----------------------------

    daily_data = {}

    for i in range(days):
        current_date = (
            start_date +
            timedelta(days=i)
        )

        daily_data[
            current_date.isoformat()
        ] = {
            "date": current_date.isoformat(),
            "revenue": 0.0,
            "transactions": 0
        }

    for sale in sales:
        sale_date = (
            sale.created_at
            .date()
            .isoformat()
        )

        if sale_date in daily_data:
            daily_data[
                sale_date
            ]["revenue"] += float(
                sale.total_amount
            )

            daily_data[
                sale_date
            ]["transactions"] += 1

    daily = list(
        daily_data.values()
    )

    # -----------------------------
    # Best-selling products
    # -----------------------------

    best_selling = db.session.query(
        Product.id,
        Product.name,
        func.sum(
            Sale.quantity
        ).label("quantity_sold"),
        func.sum(
            Sale.total_amount
        ).label("revenue")
    ).join(
        Sale,
        Sale.product_id == Product.id
    ).filter(
        Sale.business_id == business_id,
        Sale.created_at >= start_datetime,
        Sale.created_at <= end_datetime
    ).group_by(
        Product.id,
        Product.name
    ).order_by(
        func.sum(
            Sale.quantity
        ).desc()
    ).limit(5).all()

    # -----------------------------
    # Low-stock products
    # -----------------------------

    low_stock = Product.query.filter(
        Product.business_id == business_id,
        Product.quantity <= Product.low_stock_threshold
    ).order_by(
        Product.quantity.asc()
    ).limit(10).all()

    # -----------------------------
    # Totals
    # -----------------------------

    total_revenue = sum(
        item["revenue"]
        for item in daily
    )

    total_transactions = sum(
        item["transactions"]
        for item in daily
    )

    # -----------------------------
    # Response
    # -----------------------------

    return {
        "analytics": {
            "days": days,

            "total_revenue": (
                total_revenue
            ),

            "total_transactions": (
                total_transactions
            ),

            "daily": daily,

            "best_selling_products": [
                {
                    "id": product.id,
                    "name": product.name,
                    "quantity_sold": int(
                        product.quantity_sold
                    ),
                    "revenue": float(
                        product.revenue
                    )
                }

                for product in best_selling
            ],

            "low_stock_products": [
                {
                    "id": product.id,
                    "name": product.name,
                    "quantity": product.quantity,
                    "threshold": (
                        product.low_stock_threshold
                    )
                }

                for product in low_stock
            ]
        }
    }, 200
