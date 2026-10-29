
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.booking_models import Booking
from app.models import Equipment
from yantra.allocation import (
    create_allocation_plan,
    check_usage_cap,
)

router = APIRouter(prefix="/allocation", tags=["Allocation"])

USAGE_LIMIT = 2
USAGE_WINDOW_DAYS = 30


def booking_to_request(booking, recent_uses):
    """Convert a database booking into an allocation request."""
    return {
        "id": booking.id,
        "farmer_id": booking.farmer_phone,
        "machine_id": booking.equipment_id,
        "requested_date": booking.start_date.isoformat(),
        "acreage": (
            booking.acreage
            if booking.acreage is not None
            else 1.0
        ),
        "days_can_wait": (
            booking.days_can_wait
            if booking.days_can_wait is not None
            else 3
        ),
        "farmer_category": booking.farmer_category or "other",
        "created_at": booking.created_at.isoformat(),
        "status": booking.status,
        "recent_uses": recent_uses,
        "eligible": True,
        "under_usage_cap": recent_uses < USAGE_LIMIT,
    }


@router.get("/plan/{equipment_id}")
def get_allocation_plan(
    equipment_id: int,
    requested_date: date = Query(
        ...,
        description="Date for which competing requests should be ranked",
    ),
    available_slots: int = Query(default=1, ge=0),
    db: Session = Depends(get_db),
):
    """Recommend allocation without automatically approving bookings."""

    equipment = (
        db.query(Equipment)
        .filter(Equipment.id == equipment_id)
        .first()
    )

    if equipment is None:
        raise HTTPException(
            status_code=404,
            detail="Equipment not found",
        )

    competing_bookings = (
        db.query(Booking)
        .filter(
            Booking.equipment_id == equipment_id,
            Booking.status == "pending",
            Booking.start_date <= requested_date,
            Booking.end_date >= requested_date,
        )
        .order_by(Booking.created_at.asc(), Booking.id.asc())
        .all()
    )

    if not competing_bookings:
        return {
            "equipment_id": equipment_id,
            "equipment_name": equipment.name,
            "requested_date": requested_date,
            "message": "No pending requests compete on this date.",
            "selected_request_ids": [],
            "waitlisted_request_ids": [],
            "recommendations": [],
            "requires_owner_confirmation": True,
        }

    cutoff = datetime.now() - timedelta(days=USAGE_WINDOW_DAYS)

    requests = []

    for booking in competing_bookings:
        recent_uses = (
            db.query(Booking)
            .filter(
                Booking.equipment_id == equipment_id,
                Booking.farmer_phone == booking.farmer_phone,
                Booking.status == "approved",
                Booking.created_at >= cutoff,
                Booking.id != booking.id,
            )
            .count()
        )

        requests.append(
            booking_to_request(booking, recent_uses)
        )

    plan = create_allocation_plan(
        requests,
        available_slots=available_slots,
    )

    usage_checks = {
        request["id"]: check_usage_cap(
            [None] * request["recent_uses"],
            limit=USAGE_LIMIT,
        )
        for request in requests
    }

    return {
        "equipment_id": equipment_id,
        "equipment_name": equipment.name,
        "requested_date": requested_date,
        "competing_request_count": len(requests),
        "selected_request_ids": plan["selected_request_ids"],
        "waitlisted_request_ids": plan["waitlisted_request_ids"],
        "recommendations": plan["recommendations"],
        "usage_checks": usage_checks,
        "temporary_defaults_used": [
            "acreage (if missing)",
            "days_can_wait (if missing)",
            "farmer_category (if missing)",
        ],
        "usage_window_days": USAGE_WINDOW_DAYS,
        "usage_limit": USAGE_LIMIT,
        "requires_owner_confirmation": True,
    }

