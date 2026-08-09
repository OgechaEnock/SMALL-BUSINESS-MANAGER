from datetime import datetime, timezone

from db import db


class Business(db.Model):
    __tablename__ = "businesses"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(
        db.String(150),
        nullable=False
    )

    business_type = db.Column(
        db.String(100),
        nullable=True
    )

    phone = db.Column(
        db.String(30),
        nullable=True
    )

    email = db.Column(
        db.String(255),
        nullable=True
    )

    address = db.Column(
        db.String(255),
        nullable=True
    )

    currency = db.Column(
        db.String(10),
        nullable=False,
        default="KES"
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

    users = db.relationship(
        "User",
        back_populates="business",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Business {self.name}>"