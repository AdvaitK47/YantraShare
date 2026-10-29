
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from contextlib import contextmanager

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from allocation import create_allocation_plan


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "yantrashare.db"

app = FastAPI(
    title="YantraShare Workflow API",
    description="Persistent equipment booking, allocation and audit workflow",
    version="1.0.0",
)


def now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


@contextmanager
def database():
    connection = sqlite3.connect(DB_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def audit(connection, actor_id, request_id, action, reason,
          old_status=None, new_status=None):
    connection.execute(
        """
        INSERT INTO audit_events
        (actor_id, request_id, action, reason,
         old_status, new_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            actor_id,
            request_id,
            action,
            reason,
            old_status,
            new_status,
            now(),
        ),
    )


def init_db():
    with database() as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS resources (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                location TEXT NOT NULL,
                description TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'available',
                requires_training INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS booking_requests (
                id TEXT PRIMARY KEY,
                farmer_id TEXT NOT NULL,
                machine_id TEXT NOT NULL,
                requested_date TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                acreage REAL NOT NULL,
                days_can_wait INTEGER NOT NULL,
                farmer_category TEXT NOT NULL,
                recent_uses INTEGER NOT NULL DEFAULT 0,
                eligible INTEGER NOT NULL DEFAULT 1,
                status TEXT NOT NULL DEFAULT 'requested',
                score INTEGER,
                rank INTEGER,
                explanation TEXT,
                waitlist_position INTEGER,
                created_at TEXT NOT NULL,
                FOREIGN KEY(machine_id) REFERENCES resources(id)
            );

            CREATE TABLE IF NOT EXISTS condition_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                request_id TEXT NOT NULL,
                stage TEXT NOT NULL,
                condition_text TEXT NOT NULL,
                photo_note TEXT,
                reporter_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(request_id) REFERENCES booking_requests(id)
            );

            CREATE TABLE IF NOT EXISTS incidents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                request_id TEXT NOT NULL,
                incident_type TEXT NOT NULL,
                description TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'reported',
                reporter_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(request_id) REFERENCES booking_requests(id)
            );

            CREATE TABLE IF NOT EXISTS audit_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                actor_id TEXT NOT NULL,
                request_id TEXT NOT NULL,
                action TEXT NOT NULL,
                reason TEXT NOT NULL,
                old_status TEXT,
                new_status TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(request_id) REFERENCES booking_requests(id)
            );

            CREATE INDEX IF NOT EXISTS idx_booking_resource_date
            ON booking_requests(machine_id, requested_date, status);

            CREATE INDEX IF NOT EXISTS idx_audit_request
            ON audit_events(request_id, created_at);
            """
        )

        demo_resources = [
            (
                "M001", "3D Printer", "Fabrication",
                "Innovation Lab",
                "FDM 3D printer for supervised prototype fabrication.",
                "available", 1, now(),
            ),
            (
                "M002", "DSLR Camera", "Media Equipment",
                "Media Room",
                "Camera kit for student projects and documentation.",
                "available", 0, now(),
            ),
            (
                "M003", "Oscilloscope", "Electronics",
                "Electronics Lab",
                "Digital oscilloscope for circuit testing.",
                "available", 1, now(),
            ),
        ]

        for resource in demo_resources:
            db.execute(
                """
                INSERT OR IGNORE INTO resources
                (id, name, category, location, description,
                 status, requires_training, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                resource,
            )


init_db()


# -------------------------------
# INPUT MODELS
# -------------------------------

class ResourceInput(BaseModel):
    id: str = Field(min_length=2, max_length=40)
    name: str = Field(min_length=2, max_length=100)
    category: str = Field(min_length=2, max_length=60)
    location: str = Field(min_length=2, max_length=100)
    description: str = Field(min_length=3, max_length=1000)
    requires_training: bool = False


class BookingInput(BaseModel):
    farmer_id: str = Field(min_length=1, max_length=80)
    machine_id: str
    requested_date: str
    start_time: str
    end_time: str
    acreage: float = Field(gt=0)
    days_can_wait: int = Field(ge=0)
    farmer_category: str
    recent_uses: int = Field(default=0, ge=0)
    eligible: bool = True


class DecisionInput(BaseModel):
    actor_id: str
    decision: str
    reason: str = Field(min_length=3, max_length=500)


class ConditionInput(BaseModel):
    actor_id: str
    condition_text: str = Field(min_length=3, max_length=1000)
    photo_note: str = ""


class IncidentInput(BaseModel):
    reporter_id: str
    incident_type: str
    description: str = Field(min_length=3, max_length=1000)


class CancelInput(BaseModel):
    actor_id: str = Field(min_length=1, max_length=80)
    reason: str = Field(min_length=3, max_length=500)


class RecoveryInput(BaseModel):
    actor_id: str = Field(min_length=1, max_length=80)
    replacement_machine_id: str = Field(min_length=2, max_length=40)
    reason: str = Field(min_length=3, max_length=500)


# -------------------------------
# HELPERS
# -------------------------------

def row_dict(row):
    return dict(row) if row else None


def get_request(db, request_id):
    row = db.execute(
        "SELECT * FROM booking_requests WHERE id = ?",
        (request_id,),
    ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Request not found")

    return row


def validate_date_and_time(data):
    try:
        datetime.strptime(data.requested_date, "%Y-%m-%d")
        start = datetime.strptime(data.start_time, "%H:%M")
        end = datetime.strptime(data.end_time, "%H:%M")
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail="Use YYYY-MM-DD dates and HH:MM times.",
        )

    if end <= start:
        raise HTTPException(
            status_code=422,
            detail="End time must be after start time.",
        )


def overlaps_existing_booking(db, machine_id, date, start, end,
                              exclude_request_id=None):
    query = """
        SELECT id FROM booking_requests
        WHERE machine_id = ?
          AND requested_date = ?
          AND status IN ('approved', 'checked_in')
          AND start_time < ?
          AND end_time > ?
    """
    params = [machine_id, date, end, start]

    if exclude_request_id:
        query += " AND id != ?"
        params.append(exclude_request_id)

    return db.execute(query, params).fetchone() is not None


def update_waitlist_positions(db, machine_id, requested_date):
    rows = db.execute(
        """
        SELECT id FROM booking_requests
        WHERE machine_id = ?
          AND requested_date = ?
          AND status = 'waitlisted'
        ORDER BY score DESC, created_at ASC, id ASC
        """,
        (machine_id, requested_date),
    ).fetchall()

    for position, row in enumerate(rows, start=1):
        db.execute(
            "UPDATE booking_requests SET waitlist_position = ? WHERE id = ?",
            (position, row["id"]),
        )


# -------------------------------
# HEALTH AND RESOURCE CATALOG
# -------------------------------

@app.get("/")
def home():
    return {
        "application": "YantraShare",
        "status": "running",
        "database": "SQLite",
        "database_path": str(DB_PATH),
    }


@app.get("/resources")
def list_resources():
    with database() as db:
        rows = db.execute(
            "SELECT * FROM resources ORDER BY name"
        ).fetchall()
        return [row_dict(row) for row in rows]


@app.post("/resources")
def create_resource(data: ResourceInput):
    with database() as db:
        try:
            db.execute(
                """
                INSERT INTO resources
                (id, name, category, location, description,
                 status, requires_training, created_at)
                VALUES (?, ?, ?, ?, ?, 'available', ?, ?)
                """,
                (
                    data.id, data.name, data.category,
                    data.location, data.description,
                    int(data.requires_training), now(),
                ),
            )
        except sqlite3.IntegrityError:
            raise HTTPException(
                status_code=409,
                detail="Resource ID already exists.",
            )

        return row_dict(
            db.execute(
                "SELECT * FROM resources WHERE id = ?",
                (data.id,),
            ).fetchone()
        )


# -------------------------------
# BOOKING REQUESTS
# -------------------------------

@app.post("/requests")
def create_request(data: BookingInput):
    validate_date_and_time(data)

    with database() as db:
        resource = db.execute(
            "SELECT * FROM resources WHERE id = ?",
            (data.machine_id,),
        ).fetchone()

        if not resource:
            raise HTTPException(status_code=404, detail="Resource not found")

        if resource["status"] != "available":
            raise HTTPException(
                status_code=409,
                detail="Resource is not available.",
            )

        if resource["requires_training"] and not data.eligible:
            raise HTTPException(
                status_code=403,
                detail="Required training or eligibility is not verified.",
            )

        if overlaps_existing_booking(
            db,
            data.machine_id,
            data.requested_date,
            data.start_time,
            data.end_time,
        ):
            raise HTTPException(
                status_code=409,
                detail="This time overlaps an approved booking.",
            )

        request_id = "REQ-" + datetime.now().strftime("%y%m%d%H%M%S%f")

        db.execute(
            """
            INSERT INTO booking_requests
            (id, farmer_id, machine_id, requested_date,
             start_time, end_time, acreage, days_can_wait,
             farmer_category, recent_uses, eligible, status,
             created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'requested', ?)
            """,
            (
                request_id, data.farmer_id, data.machine_id,
                data.requested_date, data.start_time, data.end_time,
                data.acreage, data.days_can_wait,
                data.farmer_category, data.recent_uses,
                int(data.eligible), now(),
            ),
        )

        audit(
            db, data.farmer_id, request_id,
            "request_created", "User submitted a resource request.",
            None, "requested",
        )

        return row_dict(
            db.execute(
                "SELECT * FROM booking_requests WHERE id = ?",
                (request_id,),
            ).fetchone()
        )


@app.get("/requests")
def list_requests():
    with database() as db:
        rows = db.execute(
            """
            SELECT b.*, r.name AS resource_name
            FROM booking_requests b
            JOIN resources r ON r.id = b.machine_id
            ORDER BY b.created_at DESC
            """
        ).fetchall()

        return [row_dict(row) for row in rows]


@app.get("/requests/{request_id}")
def request_detail(request_id: str):
    with database() as db:
        request = get_request(db, request_id)

        conditions = db.execute(
            """
            SELECT * FROM condition_reports
            WHERE request_id = ? ORDER BY created_at
            """,
            (request_id,),
        ).fetchall()

        incidents = db.execute(
            """
            SELECT * FROM incidents
            WHERE request_id = ? ORDER BY created_at
            """,
            (request_id,),
        ).fetchall()

        events = db.execute(
            """
            SELECT * FROM audit_events
            WHERE request_id = ? ORDER BY created_at
            """,
            (request_id,),
        ).fetchall()

        return {
            "request": row_dict(request),
            "condition_reports": [row_dict(r) for r in conditions],
            "incidents": [row_dict(r) for r in incidents],
            "audit_history": [row_dict(r) for r in events],
        }


# -------------------------------
# FAIR ALLOCATION
# -------------------------------

@app.post("/allocation/run/{machine_id}/{requested_date}")
def run_allocation(machine_id: str, requested_date: str):
    try:
        datetime.strptime(requested_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail="Date must use YYYY-MM-DD format.",
        )

    with database() as db:
        resource = db.execute(
            "SELECT * FROM resources WHERE id = ?",
            (machine_id,),
        ).fetchone()

        if not resource:
            raise HTTPException(status_code=404, detail="Resource not found")

        if resource["status"] != "available":
            raise HTTPException(
                status_code=409,
                detail="Resource is not available for allocation.",
            )

        rows = db.execute(
            """
            SELECT * FROM booking_requests
            WHERE machine_id = ?
              AND requested_date = ?
              AND status IN ('requested', 'waitlisted')
            ORDER BY created_at
            """,
            (machine_id, requested_date),
        ).fetchall()

        if not rows:
            return {
                "selected_request_ids": [],
                "waitlisted_request_ids": [],
                "recommendations": [],
                "message": "No requests to allocate.",
            }

        requests = []

        for row in rows:
            item = row_dict(row)
            item["under_usage_cap"] = item["recent_uses"] < 2
            requests.append(item)

        approved_slots = db.execute(
            """
            SELECT COUNT(*) AS total FROM booking_requests
            WHERE machine_id = ?
              AND requested_date = ?
              AND status IN ('approved', 'checked_in')
            """,
            (machine_id, requested_date),
        ).fetchone()["total"]

        # Prototype rule: one machine has one booking at a time.
        available_slots = max(0, 1 - approved_slots)

        plan = create_allocation_plan(
            requests,
            available_slots=available_slots,
        )

        for recommendation in plan["recommendations"]:
            request_id = recommendation["request_id"]

            db.execute(
                """
                UPDATE booking_requests
                SET score = ?, rank = ?, explanation = ?
                WHERE id = ?
                """,
                (
                    recommendation.get("score"),
                    recommendation.get("rank"),
                    recommendation.get("explanation", ""),
                    request_id,
                ),
            )

            row = db.execute(
                "SELECT status FROM booking_requests WHERE id = ?",
                (request_id,),
            ).fetchone()

            audit(
                db, "SYSTEM", request_id,
                "allocation_recommended",
                recommendation.get("explanation", "Allocation evaluated."),
                row["status"], row["status"],
            )

        selected = set(plan["selected_request_ids"])
        waitlisted = set(plan["waitlisted_request_ids"])

        for request_id in selected:
            db.execute(
                """
                UPDATE booking_requests
                SET status = 'requested', waitlist_position = NULL
                WHERE id = ? AND status IN ('requested', 'waitlisted')
                """,
                (request_id,),
            )

        for request_id in waitlisted:
            db.execute(
                """
                UPDATE booking_requests
                SET status = 'waitlisted'
                WHERE id = ? AND status IN ('requested', 'waitlisted')
                """,
                (request_id,),
            )

        update_waitlist_positions(db, machine_id, requested_date)

        return plan


# -------------------------------
# OWNER DECISION
# -------------------------------

@app.post("/requests/{request_id}/decision")
def owner_decision(request_id: str, data: DecisionInput):
    decision = data.decision.lower().strip()

    if decision not in {"approved", "rejected", "waitlisted"}:
        raise HTTPException(
            status_code=422,
            detail="Decision must be approved, rejected, or waitlisted.",
        )

    with database() as db:
        request = get_request(db, request_id)

        if request["status"] not in {"requested", "waitlisted"}:
            raise HTTPException(
                status_code=409,
                detail=f"Cannot decide on a request in status {request['status']}.",
            )

        resource = db.execute(
            "SELECT * FROM resources WHERE id = ?",
            (request["machine_id"],),
        ).fetchone()

        if decision == "approved":
            if resource["status"] != "available":
                raise HTTPException(
                    status_code=409,
                    detail="Resource is unavailable.",
                )

            if not request["eligible"]:
                raise HTTPException(
                    status_code=403,
                    detail="Request is not eligible.",
                )

            if overlaps_existing_booking(
                db,
                request["machine_id"],
                request["requested_date"],
                request["start_time"],
                request["end_time"],
                exclude_request_id=request_id,
            ):
                raise HTTPException(
                    status_code=409,
                    detail="Another approved booking overlaps this time.",
                )

        old_status = request["status"]

        db.execute(
            """
            UPDATE booking_requests
            SET status = ?, waitlist_position = NULL
            WHERE id = ?
            """,
            (decision, request_id),
        )

        audit(
            db, data.actor_id, request_id,
            "owner_decision", data.reason,
            old_status, decision,
        )

        update_waitlist_positions(
            db, request["machine_id"], request["requested_date"]
        )

        return row_dict(
            db.execute(
                "SELECT * FROM booking_requests WHERE id = ?",
                (request_id,),
            ).fetchone()
        )


# -------------------------------
# CHECK-IN AND RETURN CONDITIONS
# -------------------------------

@app.post("/requests/{request_id}/check-in")
def check_in(request_id: str, data: ConditionInput):
    with database() as db:
        request = get_request(db, request_id)

        if request["status"] != "approved":
            raise HTTPException(
                status_code=409,
                detail="Only approved bookings can check in.",
            )

        db.execute(
            """
            INSERT INTO condition_reports
            (request_id, stage, condition_text, photo_note,
             reporter_id, created_at)
            VALUES (?, 'before', ?, ?, ?, ?)
            """,
            (
                request_id, data.condition_text, data.photo_note,
                data.actor_id, now(),
            ),
        )

        db.execute(
            "UPDATE booking_requests SET status = 'checked_in' WHERE id = ?",
            (request_id,),
        )

        audit(
            db, data.actor_id, request_id,
            "checked_in", "Initial condition recorded.",
            "approved", "checked_in",
        )

        return {
            "request_id": request_id,
            "status": "checked_in",
            "message": "Initial condition recorded.",
        }


@app.post("/requests/{request_id}/return")
def return_resource(request_id: str, data: ConditionInput):
    with database() as db:
        request = get_request(db, request_id)

        if request["status"] != "checked_in":
            raise HTTPException(
                status_code=409,
                detail="Only checked-in resources can be returned.",
            )

        db.execute(
            """
            INSERT INTO condition_reports
            (request_id, stage, condition_text, photo_note,
             reporter_id, created_at)
            VALUES (?, 'after', ?, ?, ?, ?)
            """,
            (
                request_id, data.condition_text, data.photo_note,
                data.actor_id, now(),
            ),
        )

        db.execute(
            "UPDATE booking_requests SET status = 'returned' WHERE id = ?",
            (request_id,),
        )

        audit(
            db, data.actor_id, request_id,
            "returned", "Return condition recorded.",
            "checked_in", "returned",
        )

        return {
            "request_id": request_id,
            "status": "returned",
            "message": "Return condition recorded.",
        }


# -------------------------------
# INCIDENT REPORTING
# -------------------------------

@app.post("/requests/{request_id}/incidents")
def report_incident(request_id: str, data: IncidentInput):
    incident_type = data.incident_type.lower().strip()

    if incident_type not in {"damage", "overdue", "breakdown", "conflict", "other"}:
        raise HTTPException(
            status_code=422,
            detail="Unsupported incident type.",
        )

    with database() as db:
        request = get_request(db, request_id)

        cursor = db.execute(
            """
            INSERT INTO incidents
            (request_id, incident_type, description,
             reporter_id, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                request_id, incident_type, data.description,
                data.reporter_id, now(),
            ),
        )

        audit(
            db, data.reporter_id, request_id,
            "incident_reported",
            f"{incident_type}: {data.description}",
            request["status"], request["status"],
        )

        if incident_type == "breakdown":
            resource = db.execute(
                "SELECT status FROM resources WHERE id = ?",
                (request["machine_id"],),
            ).fetchone()
            if resource and resource["status"] != "maintenance":
                db.execute(
                    "UPDATE resources SET status = 'maintenance' WHERE id = ?",
                    (request["machine_id"],),
                )
                audit(
                    db, "SYSTEM", request_id,
                    "resource_marked_maintenance",
                    "Resource marked unavailable after a breakdown report.",
                    request["status"], request["status"],
                )

        return {
            "incident_id": cursor.lastrowid,
            "request_id": request_id,
            "incident_type": incident_type,
            "status": "reported",
        }


# -------------------------------
# CANCELLATION AND WAITLIST PROMOTION
# -------------------------------

def promote_next_waitlisted(db, machine_id, requested_date, actor_id="SYSTEM"):
    """Promote the highest-ranked eligible waitlisted request to requested.

    Promotion is a recommendation for owner review, not automatic approval.
    """
    candidates = db.execute(
        """
        SELECT * FROM booking_requests
        WHERE machine_id = ?
          AND requested_date = ?
          AND status = 'waitlisted'
          AND eligible = 1
          AND recent_uses < 2
        ORDER BY COALESCE(score, 0) DESC, created_at ASC, id ASC
        """,
        (machine_id, requested_date),
    ).fetchall()

    for candidate in candidates:
        if not overlaps_existing_booking(
            db, machine_id, requested_date,
            candidate["start_time"], candidate["end_time"],
            exclude_request_id=candidate["id"],
        ):
            old_status = candidate["status"]
            db.execute(
                """
                UPDATE booking_requests
                SET status = 'requested', waitlist_position = NULL
                WHERE id = ?
                """,
                (candidate["id"],),
            )
            audit(
                db, actor_id, candidate["id"],
                "waitlist_promoted",
                "Promoted from waitlist; owner approval is still required.",
                old_status, "requested",
            )
            update_waitlist_positions(db, machine_id, requested_date)
            promoted = db.execute(
                "SELECT * FROM booking_requests WHERE id = ?",
                (candidate["id"],),
            ).fetchone()
            return row_dict(promoted)

    update_waitlist_positions(db, machine_id, requested_date)
    return None


@app.post("/requests/{request_id}/cancel")
def cancel_request(request_id: str, data: CancelInput):
    """Cancel a pending or approved request and promote the next safe candidate."""
    with database() as db:
        request = get_request(db, request_id)
        if request["status"] not in {"requested", "waitlisted", "approved"}:
            raise HTTPException(
                status_code=409,
                detail=f"Cannot cancel a request in status {request['status']}.",
            )

        old_status = request["status"]
        db.execute(
            "UPDATE booking_requests SET status = 'cancelled', waitlist_position = NULL WHERE id = ?",
            (request_id,),
        )
        audit(
            db, data.actor_id, request_id,
            "booking_cancelled", data.reason, old_status, "cancelled",
        )

        promoted = promote_next_waitlisted(
            db, request["machine_id"], request["requested_date"], data.actor_id
        )
        return {
            "cancelled_request_id": request_id,
            "status": "cancelled",
            "promoted_request": promoted,
            "message": (
                "Booking cancelled and a waitlisted request was promoted for owner review."
                if promoted else
                "Booking cancelled. No eligible non-conflicting waitlisted request was available."
            ),
        }


@app.post("/waitlist/promote/{machine_id}/{requested_date}")
def promote_waitlist(machine_id: str, requested_date: str):
    """Manually promote the next eligible, non-conflicting waitlisted request."""
    try:
        datetime.strptime(requested_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=422, detail="Date must use YYYY-MM-DD format.")

    with database() as db:
        resource = db.execute(
            "SELECT * FROM resources WHERE id = ?", (machine_id,)
        ).fetchone()
        if not resource:
            raise HTTPException(status_code=404, detail="Resource not found")
        if resource["status"] != "available":
            raise HTTPException(status_code=409, detail="Resource is not available.")

        promoted = promote_next_waitlisted(db, machine_id, requested_date)
        if not promoted:
            return {
                "promoted_request": None,
                "message": "No eligible non-conflicting waitlisted request was available.",
            }
        return {
            "promoted_request": promoted,
            "message": "Waitlisted request promoted to requested; owner approval is still required.",
        }


# -------------------------------
# INCIDENT RECOVERY
# -------------------------------

@app.get("/requests/{request_id}/recovery-options")
def recovery_options(request_id: str):
    """List available alternative resources in the same category as the affected resource."""
    with database() as db:
        request = get_request(db, request_id)
        original = db.execute(
            "SELECT * FROM resources WHERE id = ?", (request["machine_id"],)
        ).fetchone()
        if not original:
            raise HTTPException(status_code=404, detail="Original resource not found")

        alternatives = db.execute(
            """
            SELECT * FROM resources
            WHERE id != ?
              AND category = ?
              AND status = 'available'
            ORDER BY name
            """,
            (original["id"], original["category"]),
        ).fetchall()

        return {
            "request_id": request_id,
            "original_resource": row_dict(original),
            "replacement_options": [row_dict(row) for row in alternatives],
            "message": (
                "Choose an available replacement and submit it to the recovery endpoint."
                if alternatives else
                "No available resource in the same category was found."
            ),
        }


@app.post("/requests/{request_id}/recovery")
def recover_booking(request_id: str, data: RecoveryInput):
    """Reassign an affected booking to an available same-category replacement."""
    with database() as db:
        request = get_request(db, request_id)
        original = db.execute(
            "SELECT * FROM resources WHERE id = ?", (request["machine_id"],)
        ).fetchone()
        replacement = db.execute(
            "SELECT * FROM resources WHERE id = ?", (data.replacement_machine_id,)
        ).fetchone()

        if not replacement:
            raise HTTPException(status_code=404, detail="Replacement resource not found")
        if replacement["id"] == request["machine_id"]:
            raise HTTPException(status_code=422, detail="Choose a different resource.")
        if replacement["status"] != "available":
            raise HTTPException(status_code=409, detail="Replacement resource is unavailable.")
        if original and replacement["category"] != original["category"]:
            raise HTTPException(
                status_code=409,
                detail="Replacement must belong to the same resource category.",
            )
        if request["status"] not in {"approved", "checked_in", "requested", "waitlisted"}:
            raise HTTPException(
                status_code=409,
                detail=f"Cannot recover a booking in status {request['status']}.",
            )
        if overlaps_existing_booking(
            db, replacement["id"], request["requested_date"],
            request["start_time"], request["end_time"],
        ):
            raise HTTPException(
                status_code=409,
                detail="Replacement resource has an overlapping approved booking.",
            )

        old_machine_id = request["machine_id"]
        db.execute(
            "UPDATE booking_requests SET machine_id = ? WHERE id = ?",
            (replacement["id"], request_id),
        )
        audit(
            db, data.actor_id, request_id,
            "recovery_replacement",
            f"{data.reason} Replacement: {old_machine_id} -> {replacement['id']}.",
            request["status"], request["status"],
        )
        return {
            "request_id": request_id,
            "previous_resource_id": old_machine_id,
            "replacement_resource_id": replacement["id"],
            "status": request["status"],
            "message": "Booking reassigned to the replacement resource.",
        }


@app.get("/audit")
def audit_history():
    with database() as db:
        rows = db.execute(
            "SELECT * FROM audit_events ORDER BY id DESC LIMIT 500"
        ).fetchall()

        return [row_dict(row) for row in rows]
