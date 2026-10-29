
from allocation import (
    create_allocation_plan,
    build_audit_event,
    make_notification,
)


def main():
    requests = [
        {
            "id": "R101",
            "farmer_id": "F1",
            "machine_id": "M1",
            "requested_date": "2026-11-01",
            "acreage": 5,
            "days_can_wait": 1,
            "farmer_category": "small",
            "recent_uses": 0,
            "created_at": "2026-10-29T09:00:00",
            "status": "requested",
            "eligible": True,
            "under_usage_cap": True,
        },
        {
            "id": "R102",
            "farmer_id": "F2",
            "machine_id": "M1",
            "requested_date": "2026-11-01",
            "acreage": 8,
            "days_can_wait": 5,
            "farmer_category": "other",
            "recent_uses": 2,
            "created_at": "2026-10-29T09:05:00",
            "status": "requested",
            "eligible": True,
            "under_usage_cap": True,
        },
        {
            "id": "R103",
            "farmer_id": "F3",
            "machine_id": "M1",
            "requested_date": "2026-11-01",
            "acreage": 3,
            "days_can_wait": 3,
            "farmer_category": "marginal",
            "recent_uses": 1,
            "created_at": "2026-10-29T09:10:00",
            "status": "requested",
            "eligible": True,
            "under_usage_cap": True,
        },
    ]

    plan = create_allocation_plan(requests, available_slots=1)

    print("\n=== YANTRASHARE ALLOCATION DEMO ===")
    print("Recommended request:", plan["selected_request_ids"])
    print("Waitlisted requests:", plan["waitlisted_request_ids"])

    print("\n--- Ranking explanations ---")
    for item in plan["recommendations"]:
        print(
            f"{item['request_id']} | "
            f"Score: {item['score']} | Rank: {item['rank']}"
        )
        print("Reason:", item["explanation"])

    if plan["selected_request_ids"]:
        request_id = plan["selected_request_ids"][0]

        audit = build_audit_event(
            actor_id="OWNER1",
            booking_id=request_id,
            action="allocation_recommended",
            reason="Top-ranked eligible request; owner confirmation required.",
            old_status="requested",
            new_status="requested",
        )

        notification = make_notification(
            "waitlisted",
            "Farmer F1",
            details=(
                "Your request is under owner review. "
                "The allocation recommendation is not final."
            ),
        )

        print("\n--- Prepared audit event ---")
        print(audit)

        print("\n--- Prepared notification ---")
        print(notification)

        print(
            "\nNo booking was approved or saved. "
            "The owner must confirm the decision."
        )


if __name__ == "__main__":
    main()
