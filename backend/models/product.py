from datetime import datetime, timezone

from db import db


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    business_id = db.Column(
        db.Integer,
        db.ForeignKey("businesses.id"),
        nullable=False
    )

    name = db.Column(
        db.String(150),
        nullable=False
    )

    description = db.Column(
        db.Text,
        nullable=True
    )

    sku = db.Column(
        db.String(100),
        nullable=True
    )

    selling_price = db.Column(
        db.Numeric(12, 2),
        nullable=False,
        default=0
    )

    cost_price = db.Column(
        db.Numeric(12, 2),
        nullable=False,
        default=0
    )

    quantity = db.Column(
        db.Integer,
        nullable=False,
        default=0
    )

    low_stock_threshold = db.Column(
        db.Integer,
        nullable=False,
        default=5
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    business = db.relationship(
        "Business",
        backref="products"
    )

    def __repr__(self):
        return f"<Product {self.name}>"