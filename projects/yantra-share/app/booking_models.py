
from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    Float,
)
from sqlalchemy.sql import func

from app.models import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    equipment_id = Column(
        Integer,
        ForeignKey("equipment.id", ondelete="CASCADE"),
        nullable=False,
    )

    farmer_name = Column(String(100), nullable=False)
    farmer_phone = Column(String(20), nullable=False)

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    # Farmer-priority information
    acreage = Column(Float, nullable=True)
    farmer_category = Column(String(20), nullable=True)
    days_can_wait = Column(Integer, nullable=True)

    # Rental cost
    total_price = Column(Numeric(10, 2), nullable=True)

    status = Column(
        String(20),
        nullable=False,
        default="pending",
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

