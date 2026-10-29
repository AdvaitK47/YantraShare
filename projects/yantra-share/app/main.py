
from datetime import date
from decimal import Decimal
from typing import Optional, Literal

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Equipment
from app.booking_models import Booking
from app.allocation_routes import router as allocation_router


app = FastAPI(
    title="YantraShare API",
    description="A platform for sharing underused agricultural equipment",
    version="1.0.0",
)

# Allocation endpoints
app.include_router(allocation_router)


# -------------------------
# Request models
# -------------------------

class EquipmentCreate(BaseModel):
    name: str
    category: str
    owner_name: str
    location: str
    rental_price_per_day: float = Field(ge=0)
    available: bool = True
    description: Optional[str] = None


class BookingCreate(BaseModel):
    equipment_id: int
    farmer_name: str = Field(min_length=1, max_length=100)
    farmer_phone: str = Field(min_length=1, max_length=20)
    start_date: date
    end_date: date

    # Farmer-priority information
    acreage: Optional[float] = Field(default=None, gt=0)
    farmer_category: Optional[
        Literal["small", "marginal", "other"]
    ] = None
    days_can_wait: Optional[int] = Field(default=None, ge=0)


class BookingStatusUpdate(BaseModel):
    status: Literal["approved", "rejected", "cancelled"]


# -------------------------
# Home
# -------------------------

@app.get("/")
def home():
    return {"message": "Welcome to YantraShare!"}


# -------------------------
# Equipment endpoints
# -------------------------

@app.get("/equipment")
def get_equipment(db: Session = Depends(get_db)):
    return db.query(Equipment).all()


@app.post("/equipment")
def add_equipment(
    item: EquipmentCreate,
    db: Session = Depends(get_db),
):
    new_item = Equipment(**item.model_dump())

    try:
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Could not create equipment. Please try again.",
        )

    return {
        "message": "Equipment listed successfully",
        "equipment": new_item,
    }


@app.get("/equipment/{equipment_id}")
def get_one_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
):
    item = (
        db.query(Equipment)
        .filter(Equipment.id == equipment_id)
        .first()
    )

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Equipment not found",
        )

    return item


@app.delete("/equipment/{equipment_id}")
def delete_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
):
    item = (
        db.query(Equipment)
        .filter(Equipment.id == equipment_id)
        .first()
    )

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Equipment not found",
        )

    db.delete(item)
    db.commit()

    return {"message": "Equipment removed successfully"}


# -------------------------
# Booking endpoints
# -------------------------

@app.post("/bookings")
def create_booking(
    item: BookingCreate,
    db: Session = Depends(get_db),
):
    # Validate rental dates
    if item.end_date < item.start_date:
        raise HTTPException(
            status_code=400,
            detail="End date cannot be before start date",
        )

    # Find the equipment
    equipment = (
        db.query(Equipment)
        .filter(Equipment.id == item.equipment_id)
        .first()
    )

    if equipment is None:
        raise HTTPException(
            status_code=404,
            detail="Equipment not found",
        )

    if not equipment.available:
        raise HTTPException(
            status_code=400,
            detail="Equipment is unavailable",
        )

    # Count both the start and end dates
    rental_days = (item.end_date - item.start_date).days + 1

    # Calculate rental cost
    daily_price = Decimal(str(equipment.rental_price_per_day))
    total_price = daily_price * rental_days

    # Save booking, farmer details, and rental cost
    booking = Booking(
        **item.model_dump(),
        status="pending",
        total_price=total_price,
    )

    try:
        db.add(booking)
        db.commit()
        db.refresh(booking)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Could not create booking. Please try again.",
        )

    return {
        "message": "Booking request created successfully",
        "booking": booking,
        "rental_days": rental_days,
        "daily_price": float(daily_price),
        "total_price": float(total_price),
    }


@app.get("/bookings")
def get_bookings(db: Session = Depends(get_db)):
    return (
        db.query(Booking)
        .order_by(Booking.created_at.desc())
        .all()
    )


@app.get("/bookings/{booking_id}")
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
):
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    return booking


@app.patch("/bookings/{booking_id}")
def update_booking_status(
    booking_id: int,
    update: BookingStatusUpdate,
    db: Session = Depends(get_db),
):
    if update.status not in ["approved", "rejected", "cancelled"]:
        raise HTTPException(
            status_code=400,
            detail="Status must be approved, rejected, or cancelled",
        )

    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    if booking.status != "pending":
        raise HTTPException(
            status_code=400,
            detail="Only pending bookings can be updated",
        )

    # Prevent overlapping approved bookings for the same equipment
    if update.status == "approved":
        overlapping = (
            db.query(Booking)
            .filter(
                Booking.equipment_id == booking.equipment_id,
                Booking.status == "approved",
                Booking.start_date <= booking.end_date,
                Booking.end_date >= booking.start_date,
                Booking.id != booking.id,
            )
            .first()
        )

        if overlapping:
            raise HTTPException(
                status_code=409,
                detail=(
                    "Equipment already has an approved booking "
                    "for these dates"
                ),
            )

    booking.status = update.status

    try:
        db.commit()
        db.refresh(booking)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Could not update booking. Please try again.",
        )

    return {
        "message": f"Booking {update.status} successfully",
        "booking": booking,
    }

