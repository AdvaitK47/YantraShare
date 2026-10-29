
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from allocation import (
    create_allocation_plan,
    check_usage_cap,
    recommend_waitlist_promotion,
    make_recovery_plan,
    make_notification,
    build_audit_event,
)

app = FastAPI(
    title="YantraShare Allocation API",
    description=(
        "Fair allocation, waitlist recommendations, "
        "resource recovery, notifications and audit previews."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# -------------------------------
# REQUEST MODELS
# -------------------------------

class AllocationRequest(BaseModel):
    id: str
    farmer_id: str
    machine_id: str
    requested_date: str
    acreage: float = Field(gt=0)
    days_can_wait: int = Field(ge=0)
    farmer_category: str
    created_at: str
    status: str = "requested"
    recent_uses: int = Field(default=0, ge=0)
    eligible: bool = True
    under_usage_cap: bool = True


class AllocationPlanInput(BaseModel):
    requests: List[AllocationRequest]
    available_slots: int = Field(default=1, ge=0)


class UsageCheckInput(BaseModel):
    recent_bookings: List[str]
    limit: int = Field(default=2, ge=1)


class PromotionInput(AllocationPlanInput):
    excluded_request_ids: List[str] = Field(default_factory=list)


class MachineInput(BaseModel):
    id: str
    name: str
    status: str
    tractor_hp_required: float = Field(ge=0)


class BookingInput(BaseModel):
    machine_id: str
    start: datetime
    end: datetime
    status: str


class RecoveryInput(BaseModel):
    id: str
    machine_id: str
    start: datetime
    end: datetime
    available_tractor_hp: float = Field(ge=0)
    incident_type: str

    machines: List[MachineInput]
    bookings: List[BookingInput] = Field(default_factory=list)


class NotificationInput(BaseModel):
    event: str
    farmer_name: str
    details: str = ""


class AuditPreviewInput(BaseModel):
    actor_id: str
    booking_id: str
    action: str
    reason: str
    old_status: str
    new_status: str


# -------------------------------
# HEALTH CHECK
# -------------------------------

@app.get("/")
def home():
    return {
        "application": "YantraShare Allocation API",
        "status": "running",
        "database_connected": False,
        "message": (
            "Allocation service is running. "
            "This prototype does not persist data."
        ),
    }


# -------------------------------
# FAIR ALLOCATION
# -------------------------------

@app.post("/allocation/plan")
def allocation_plan(data: AllocationPlanInput):
    try:
        requests = [item.dict() for item in data.requests]

        return create_allocation_plan(
            requests,
            available_slots=data.available_slots,
        )
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid allocation input: {exc}",
        )


# -------------------------------
# USAGE LIMIT
# -------------------------------

@app.post("/allocation/usage-check")
def usage_check(data: UsageCheckInput):
    return check_usage_cap(
        data.recent_bookings,
        limit=data.limit,
    )


# -------------------------------
# WAITLIST PROMOTION
# -------------------------------

@app.post("/allocation/waitlist-promotion")
def waitlist_promotion(data: PromotionInput):
    try:
        requests = [item.dict() for item in data.requests]

        return recommend_waitlist_promotion(
            requests,
            available_slots=data.available_slots,
            excluded_request_ids=data.excluded_request_ids,
        )
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid promotion input: {exc}",
        )


# -------------------------------
# BREAKDOWN / OVERDUE RECOVERY
# -------------------------------

@app.post("/allocation/recovery")
def allocation_recovery(data: RecoveryInput):
    if data.end <= data.start:
        raise HTTPException(
            status_code=422,
            detail="Booking end must be after booking start.",
        )

    affected = {
        "id": data.id,
        "machine_id": data.machine_id,
        "start": data.start,
        "end": data.end,
        "available_tractor_hp": data.available_tractor_hp,
    }

    machines = [machine.dict() for machine in data.machines]
    bookings = [booking.dict() for booking in data.bookings]

    try:
        return make_recovery_plan(
            affected,
            machines,
            bookings,
            data.incident_type,
        )
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid recovery input: {exc}",
        )


# -------------------------------
# NOTIFICATION PREVIEW
# -------------------------------

@app.post("/notifications/preview")
def notification_preview(data: NotificationInput):
    try:
        return make_notification(
            data.event,
            data.farmer_name,
            data.details,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))


# -------------------------------
# AUDIT EVENT PREVIEW
# -------------------------------

@app.post("/audit/preview")
def audit_preview(data: AuditPreviewInput):
    return build_audit_event(
        actor_id=data.actor_id,
        booking_id=data.booking_id,
        action=data.action,
        reason=data.reason,
        old_status=data.old_status,
        new_status=data.new_status,
    )
