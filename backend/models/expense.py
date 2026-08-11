from datetime import datetime

from db import db


class Expense(db.Model):
    __tablename__ = "expenses"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    business_id = db.Column(
        db.Integer,
        db.ForeignKey("businesses.id"),
        nullable=False
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    description = db.Column(
        db.String(255),
        nullable=False
    )

    category = db.Column(
        db.String(100),
        nullable=False
    )

    amount = db.Column(
        db.Numeric(12, 2),
        nullable=False
    )

    expense_date = db.Column(
        db.Date,
        nullable=False
    )

    notes = db.Column(
        db.Text,
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    business = db.relationship(
        "Business",
        backref="expenses"
    )

    user = db.relationship(
        "User",
        backref="expenses"
    )

    def __repr__(self):
        return f"<Expense {self.id}>"