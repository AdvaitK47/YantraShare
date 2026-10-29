
import unittest
from datetime import datetime

from allocation import (
    rank_requests,
    check_usage_cap,
    create_allocation_plan,
    find_replacements,
    make_notification,
    recommend_waitlist_promotion,
    build_audit_event,
    make_recovery_plan,
)


def sample_requests():
    return [
        {
            "id": "R1",
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
            "id": "R2",
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
    ]


class AllocationTests(unittest.TestCase):

    def test_urgent_farmer_ranks_first(self):
        ranked = rank_requests(sample_requests())

        self.assertEqual(ranked[0]["request_id"], "R1")
        self.assertEqual(ranked[0]["rank"], 1)
        self.assertEqual(ranked[0]["score"], 100)
        self.assertIn("explanation", ranked[0])

    def test_usage_cap(self):
        result = check_usage_cap(["B1", "B2"], limit=2)

        self.assertFalse(result["allowed"])
        self.assertEqual(result["count"], 2)
        self.assertEqual(result["limit"], 2)

    def test_waitlist(self):
        plan = create_allocation_plan(
            sample_requests(),
            available_slots=1,
        )

        self.assertEqual(plan["selected_request_ids"], ["R1"])
        self.assertEqual(plan["waitlisted_request_ids"], ["R2"])
        self.assertEqual(len(plan["recommendations"]), 2)

    def test_ineligible_request_not_ranked(self):
        requests = sample_requests()
        requests[0]["eligible"] = False

        plan = create_allocation_plan(requests, 1)

        farmer_a = next(
            item for item in plan["recommendations"]
            if item["request_id"] == "R1"
        )

        self.assertIsNone(farmer_a["rank"])
        self.assertIsNone(farmer_a["score"])
        self.assertNotIn("R1", plan["selected_request_ids"])
        self.assertNotIn("R1", plan["waitlisted_request_ids"])

    def test_replacement(self):
        start = datetime(2026, 11, 1, 8)
        end = datetime(2026, 11, 1, 12)

        affected = {
            "machine_id": "M1",
            "start": start,
            "end": end,
            "available_tractor_hp": 60,
        }

        machines = [
            {
                "id": "M2",
                "name": "Backup Seeder",
                "status": "available",
                "tractor_hp_required": 50,
            },
            {
                "id": "M3",
                "name": "Broken Seeder",
                "status": "broken",
                "tractor_hp_required": 40,
            },
        ]

        options = find_replacements(affected, machines, [])

        self.assertEqual(len(options), 1)
        self.assertEqual(options[0]["machine_id"], "M2")
        self.assertIn("reason", options[0])
        self.assertTrue(
            options[0]["requires_owner_confirmation"]
        )

    def test_replacement_excludes_booking_conflict(self):
        start = datetime(2026, 11, 1, 8)
        end = datetime(2026, 11, 1, 12)

        affected = {
            "id": "R1",
            "machine_id": "M1",
            "start": start,
            "end": end,
            "available_tractor_hp": 60,
        }

        machines = [
            {
                "id": "M2",
                "name": "Busy Seeder",
                "status": "available",
                "tractor_hp_required": 50,
            }
        ]

        bookings = [
            {
                "machine_id": "M2",
                "start": datetime(2026, 11, 1, 9),
                "end": datetime(2026, 11, 1, 11),
                "status": "approved",
            }
        ]

        options = find_replacements(
            affected, machines, bookings
        )

        self.assertEqual(options, [])

    def test_notification(self):
        result = make_notification("breakdown", "Farmer A")

        self.assertEqual(result["recipient"], "Farmer A")
        self.assertEqual(result["event_type"], "breakdown")
        self.assertIn("message", result)
        self.assertFalse(result["read"])

    def test_waitlist_promotion_after_cancellation(self):
        requests = sample_requests()

        plan = recommend_waitlist_promotion(
            requests,
            available_slots=1,
            excluded_request_ids=["R1"],
        )

        self.assertEqual(
            plan["recommended_request_ids"], ["R2"]
        )
        self.assertTrue(
            plan["requires_owner_confirmation"]
        )

    def test_audit_event_structure(self):
        event = build_audit_event(
            actor_id="OWNER1",
            booking_id="R1",
            action="waitlist_promotion_recommended",
            reason="A previously allocated slot became available.",
            old_status="waitlisted",
            new_status="waitlisted",
        )

        self.assertEqual(event["actor_id"], "OWNER1")
        self.assertEqual(event["booking_id"], "R1")
        self.assertEqual(
            event["action"],
            "waitlist_promotion_recommended",
        )
        self.assertIn("reason", event)
        self.assertIn("created_at", event)

    def test_recovery_plan(self):
        start = datetime(2026, 11, 1, 8)
        end = datetime(2026, 11, 1, 12)

        affected = {
            "id": "R1",
            "machine_id": "M1",
            "start": start,
            "end": end,
            "available_tractor_hp": 60,
        }

        machines = [
            {
                "id": "M2",
                "name": "Backup Seeder",
                "status": "available",
                "tractor_hp_required": 50,
            }
        ]

        plan = make_recovery_plan(
            affected,
            machines,
            [],
            "breakdown",
        )

        self.assertEqual(plan["incident_type"], "breakdown")
        self.assertEqual(
            plan["replacement_options"][0]["machine_id"],
            "M2",
        )
        self.assertTrue(
            plan["requires_owner_confirmation"]
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
