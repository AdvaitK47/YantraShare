
from datetime import datetime


def _eligible(request):
    return (
        request.get("eligible", True)
        and request.get("under_usage_cap", True)
    )


def _score_request(request, position, total):
    days = int(request["days_can_wait"])
    uses = int(request.get("recent_uses", 0))
    category = request["farmer_category"].lower()

    if days < 0 or uses < 0:
        raise ValueError("Days and usage cannot be negative.")

    urgency = (
        40 if days <= 1 else
        30 if days <= 3 else
        20 if days <= 5 else
        10 if days <= 7 else 0
    )

    farmer = 30 if category in {"small", "marginal"} else 15
    usage = 20 if uses == 0 else 10 if uses == 1 else 0

    time_score = (
        10 if total <= 1
        else round(10 * (total - 1 - position) / (total - 1))
    )

    score = urgency + farmer + usage + time_score

    return {
        "request_id": request["id"],
        "score": score,
        "explanation": (
            f"Score {score}/100: urgency {urgency}/40; "
            f"farmer category {farmer}/30; "
            f"recent usage {usage}/20; "
            f"request time {time_score}/10."
        ),
        "_days": days,
        "_category": category,
        "_uses": uses,
        "_created": str(request["created_at"]),
    }


# 1. Rank competing requests
def rank_requests(requests):
    eligible = [r for r in requests if _eligible(r)]

    eligible.sort(
        key=lambda r: (
            str(r["created_at"]),
            str(r["id"]),
        )
    )

    total = len(eligible)
    scored = [
        _score_request(r, i, total)
        for i, r in enumerate(eligible)
    ]

    scored.sort(
        key=lambda r: (
            -r["score"],
            r["_days"],
            0 if r["_category"] in {"small", "marginal"} else 1,
            r["_uses"],
            r["_created"],
            str(r["request_id"]),
        )
    )

    results = []
    ranks = {}

    for rank, item in enumerate(scored, start=1):
        ranks[item["request_id"]] = rank
        results.append({
            "request_id": item["request_id"],
            "score": item["score"],
            "rank": rank,
            "explanation": item["explanation"],
        })

    # Include excluded requests in recommendations, but do not
    # give them a competitive rank or allocation recommendation.
    for request in requests:
        if not _eligible(request):
            results.append({
                "request_id": request["id"],
                "score": None,
                "rank": None,
                "explanation": (
                    "Not ranked: eligibility failed or usage "
                    "cap reached. Authorised review is required."
                ),
            })

    return results


# 2. Check fair-usage limits
def check_usage_cap(recent_bookings, limit=2):
    if limit < 1:
        raise ValueError("Limit must be at least 1.")

    count = len(recent_bookings)
    allowed = count < limit

    return {
        "allowed": allowed,
        "count": count,
        "limit": limit,
        "reason": (
            "Usage limit reached; owner review required."
            if not allowed
            else "Usage limit not reached."
        ),
    }


# 3. Recommend allocation and waitlist positions
def create_allocation_plan(requests, available_slots=1):
    if available_slots < 0:
        raise ValueError("Available slots cannot be negative.")

    recommendations = rank_requests(requests)

    eligible = [
        item for item in recommendations
        if item["rank"] is not None
    ]

    selected = eligible[:available_slots]
    waitlisted = eligible[available_slots:]

    return {
        "selected_request_ids": [
            item["request_id"] for item in selected
        ],
        "waitlisted_request_ids": [
            item["request_id"] for item in waitlisted
        ],
        "recommendations": recommendations,
    }


# 4. Suggest compatible replacement machines
def find_replacements(affected_booking, machines, bookings):
    options = []

    for machine in machines:
        if machine["id"] == affected_booking["machine_id"]:
            continue

        if machine.get("status") != "available":
            continue

        required_hp = machine.get("tractor_hp_required", 0)
        available_hp = affected_booking.get("available_tractor_hp", 0)

        if required_hp > available_hp:
            continue

        conflict = any(
            booking["machine_id"] == machine["id"]
            and booking.get("status") in {"approved", "checked_in"}
            and booking["start"] < affected_booking["end"]
            and affected_booking["start"] < booking["end"]
            for booking in bookings
        )

        if conflict:
            continue

        options.append({
            "machine_id": machine["id"],
            "reason": (
                "Machine is available, meets the supplied "
                "tractor horsepower requirement, and has no "
                "known overlapping active booking."
            ),
            "requires_owner_confirmation": True,
        })

    return options


# 5. Create notification data
def make_notification(event, farmer_name, details=""):
    messages = {
        "approved": "Your booking has been approved.",
        "waitlisted": "Your request is on the waitlist.",
        "cancelled": "Your booking has been cancelled.",
        "breakdown": (
            "Your booked machine is unavailable. "
            "The operator is reviewing alternatives."
        ),
        "overdue": (
            "A return delay may affect your booking. "
            "Please contact the operator."
        ),
        "replacement": (
            "A replacement machine has been suggested. "
            "The operator must confirm it."
        ),
    }

    if event not in messages:
        raise ValueError("Unknown notification event.")

    return {
        "recipient": farmer_name,
        "event_type": event,
        "message": messages[event],
        "details": details,
        "read": False,
        "created_at": datetime.now().isoformat(
            timespec="seconds"
        ),
    }

# -------------------------------
# 6. WAITLIST PROMOTION
# -------------------------------

def recommend_waitlist_promotion(
    requests,
    available_slots=1,
    excluded_request_ids=None,
):
    """
    Recalculate the queue after a cancellation or
    availability change.

    The caller must supply only requests competing for
    the relevant resource and time slot. Exclude requests
    already allocated or otherwise no longer eligible.
    This function recommends; it does not approve.
    """
    excluded = set(excluded_request_ids or [])

    candidates = [
        request for request in requests
        if request["id"] not in excluded
        and request.get("status", "requested")
        in {"requested", "waitlisted"}
    ]

    plan = create_allocation_plan(candidates, available_slots)

    return {
        "recommended_request_ids": plan["selected_request_ids"],
        "remaining_waitlist_ids": plan["waitlisted_request_ids"],
        "recommendations": plan["recommendations"],
        "requires_owner_confirmation": True,
    }


# -------------------------------
# 7. AUDIT EVENT DATA
# -------------------------------

def build_audit_event(
    actor_id,
    booking_id,
    action,
    reason,
    old_status,
    new_status,
):
    """
    Return an audit record for the backend to persist.
    This function does not write to the database.
    """
    return {
        "actor_id": actor_id,
        "booking_id": booking_id,
        "action": action,
        "reason": reason,
        "old_status": old_status,
        "new_status": new_status,
        "created_at": datetime.now().isoformat(
            timespec="seconds"
        ),
    }


# -------------------------------
# 8. RECOVERY PLAN
# -------------------------------

def make_recovery_plan(
    affected_booking,
    machines,
    bookings,
    incident_type,
):
    """
    Prepare suggestions for a breakdown or overdue return.
    The owner/backend decides what action to take.
    """
    if incident_type not in {"breakdown", "overdue"}:
        raise ValueError(
            "incident_type must be breakdown or overdue"
        )

    replacements = find_replacements(
        affected_booking,
        machines,
        bookings,
    )

    if replacements:
        message = (
            "Compatible replacement options are available "
            "for owner review."
        )
    else:
        message = (
            "No compatible replacement was found. "
            "The owner should review rescheduling or cancellation."
        )

    return {
        "booking_id": affected_booking.get("id"),
        "incident_type": incident_type,
        "replacement_options": replacements,
        "message": message,
        "requires_owner_confirmation": True,
    }
