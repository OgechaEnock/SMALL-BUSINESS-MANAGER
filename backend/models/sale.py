from datetime import datetime

from db import db


class Sale(db.Model):
    __tablename__ = "sales"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    business_id = db.Column(
        db.Integer,
        db.ForeignKey("businesses.id"),
        nullable=False
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=False
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    quantity = db.Column(
        db.Integer,
        nullable=False
    )

    unit_price = db.Column(
        db.Numeric(12, 2),
        nullable=False
    )

    total_amount = db.Column(
        db.Numeric(12, 2),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    product = db.relationship(
        "Product",
        backref="sales"
    )

    user = db.relationship(
        "User",
        backref="sales"
    )

    business = db.relationship(
        "Business",
        backref="sales"
    )

    def __repr__(self):
        return f"<Sale {self.id}>"
