
import unittest
from allocation import create_allocation_plan


def make_request(
    request_id,
    farmer_id,
    machine_id,
    requested_date,
    days_can_wait,
    category,
    recent_uses,
    created_at,
):
    return {
        "id": request_id,
        "farmer_id": farmer_id,
        "machine_id": machine_id,
        "requested_date": requested_date,
        "acreage": 5,
        "days_can_wait": days_can_wait,
        "farmer_category": category,
        "recent_uses": recent_uses,
        "created_at": created_at,
        "status": "requested",
        "eligible": True,
        "under_usage_cap": True,
    }


def allocate_by_machine_and_date(requests, available_slots=1):
    """
    Demonstration helper: group requests by machine and date.
    Production code must use the actual booking time slot too.
    """
    groups = {}

    for request in requests:
        key = (
            request["machine_id"],
            request["requested_date"],
        )
        groups.setdefault(key, []).append(request)

    plans = {}

    for key, group in groups.items():
        plans[key] = create_allocation_plan(
            group,
            available_slots=available_slots,
        )

    return plans


class CompetitionTests(unittest.TestCase):

    def test_different_machines_do_not_compete(self):
        requests = [
            make_request(
                "R1", "F1", "SEEDER", "2026-11-01",
                1, "small", 0, "2026-10-29T09:00:00",
            ),
            make_request(
                "R2", "F2", "TRACTOR", "2026-11-01",
                5, "other", 2, "2026-10-29T09:05:00",
            ),
        ]

        plans = allocate_by_machine_and_date(requests)

        seeder = plans[("SEEDER", "2026-11-01")]
        tractor = plans[("TRACTOR", "2026-11-01")]

        self.assertEqual(seeder["selected_request_ids"], ["R1"])
        self.assertEqual(tractor["selected_request_ids"], ["R2"])

    def test_different_dates_do_not_compete(self):
        requests = [
            make_request(
                "R1", "F1", "SEEDER", "2026-11-01",
                1, "small", 0, "2026-10-29T09:00:00",
            ),
            make_request(
                "R2", "F2", "SEEDER", "2026-11-02",
                5, "other", 2, "2026-10-29T09:05:00",
            ),
        ]

        plans = allocate_by_machine_and_date(requests)

        day_one = plans[("SEEDER", "2026-11-01")]
        day_two = plans[("SEEDER", "2026-11-02")]

        self.assertEqual(day_one["selected_request_ids"], ["R1"])
        self.assertEqual(day_two["selected_request_ids"], ["R2"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
