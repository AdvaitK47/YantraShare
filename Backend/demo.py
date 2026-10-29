
from allocation import create_allocation_plan

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
        "eligible": True,
        "under_usage_cap": True,
    },
]

plan = create_allocation_plan(requests, available_slots=1)

print("Selected:", plan["selected_request_ids"])
print("Waitlisted:", plan["waitlisted_request_ids"])

for item in plan["recommendations"]:
    print(
        item["request_id"],
        item["score"],
        item["rank"],
        item["explanation"],
    )
