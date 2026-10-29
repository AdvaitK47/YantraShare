# YantraShare — Allocation and Recovery Backend

## 1. Role Overview

This module implements fair allocation recommendations and recovery logic for YantraShare, a resource-sharing platform. It works with a FastAPI workflow backend that manages resource bookings, owner decisions, condition reports, incidents, and audit history.

## 2. Features Implemented

### Fair Allocation and Ranking
- Ranks competing eligible booking requests.
- Calculates a score out of 100.
- Considers urgency, farmer category, recent usage, and request time.
- Generates explanations for allocation recommendations.
- Excludes ineligible requests from competitive ranking.

### Fair-Usage Limits
- Evaluates recent usage against a configurable usage limit.
- Identifies requests that require additional review.

### Waitlist Management
- Produces selected and waitlisted request IDs.
- Recalculates allocation recommendations when availability changes.
- Supports waitlist promotion following cancellation.
- Returns promoted requests to the requested state for owner review rather than automatically approving them.

### Breakdown and Recovery
- Identifies available replacement resources in the same category.
- Rejects unavailable or incompatible replacement resources.
- Checks for overlapping active bookings before reassignment.
- Requires an authorised owner action through the recovery endpoint.

### Notifications and Audit Events
- Generates notification data for supported workflow events.
- Produces structured audit-event data.
- The workflow API persists audit events in SQLite, including actor, request, action, reason, status information, and timestamp.

## 3. Technology Stack

- Python
- FastAPI
- Pydantic
- SQLite for workflow persistence
- Python standard library
- `unittest` for automated tests

The allocation logic is separated from the workflow API so that recommendations can be reused by the backend.

## 4. Project Files

- `allocation.py` — allocation scoring, usage limits, waitlisting, recovery recommendations, notifications, and audit-event logic.
- `test_allocation.py` — automated allocation and recovery unit tests.
- `test_competition.py` — tests for competition across dates and resources.
- `demo.py` — demonstration of allocation logic.
- `allocation_api.py` — allocation API application.
- `workflow_api.py` — persistent resource and booking workflow, owner decisions, cancellation, check-in/return, incident reporting, recovery, and audit endpoints.
- `integration_demo.py` — integration demonstration, if included in the current project.
- `PERSON2_README.md` — implementation and setup documentation.

## 5. Allocation Inputs and Outputs

Request inputs can include:
- `id`
- `farmer_id`
- `machine_id`
- `requested_date`
- `acreage`
- `days_can_wait`
- `farmer_category`
- `created_at`
- `status`
- `recent_uses`
- Eligibility and usage-cap fields

The allocation plan returns:
- `selected_request_ids`
- `waitlisted_request_ids`
- `recommendations`

Each recommendation can include the request ID, score, rank, and explanation. Requests excluded from ranking receive an explanatory result without a competitive rank.

## 6. Important Workflow API Endpoints

The workflow API exposes these endpoints:

- `GET /resources` — list resources.
- `POST /resources` — create a resource.
- `POST /requests` — create a booking request.
- `GET /requests` — list booking requests.
- `GET /requests/{request_id}` — retrieve booking details, condition reports, incidents, and audit history.
- `POST /allocation/run/{machine_id}/{requested_date}` — calculate allocation recommendations.
- `POST /requests/{request_id}/decision` — record an owner decision.
- `POST /requests/{request_id}/check-in` — record initial condition and check in.
- `POST /requests/{request_id}/return` — record return condition.
- `POST /requests/{request_id}/incidents` — report an incident.
- `POST /requests/{request_id}/cancel` — cancel a booking and attempt waitlist promotion.
- `POST /waitlist/promote/{machine_id}/{requested_date}` — promote an eligible waitlisted request for owner review.
- `GET /requests/{request_id}/recovery-options` — list compatible replacement resources.
- `POST /requests/{request_id}/recovery` — reassign an eligible booking to a replacement resource.
- `GET /audit` — retrieve recent audit events.

## 7. Setup and Testing

Run these commands from the project directory.

Start the allocation API:

```bash
python -m uvicorn allocation_api:app --reload
```

Start the workflow API in a separate terminal:

```bash
python -m uvicorn workflow_api:app --reload --port 8001
```

Open the Swagger interfaces:
- Allocation API: `http://127.0.0.1:8000/docs`
- Workflow API: `http://127.0.0.1:8001/docs`

Run the automated test suite:

```bash
python -m unittest discover -v
```

Run the demonstration:

```bash
python demo.py
```

The current automated test run completed successfully with 12 tests passing. Python syntax validation also passed for `allocation.py`, `allocation_api.py`, and `workflow_api.py`.

## 8. Architecture and Data Persistence

The allocation module calculates recommendations and generates structured data. The workflow API manages the operational booking process and persists its data in the project's SQLite database, `yantrashare.db`.

The workflow includes booking creation, owner decisions, availability checks, condition reports, incident reporting, cancellation, waitlist promotion, recovery reassignment, and audit logging.

PostgreSQL and SQLAlchemy integration would be a future migration, not a description of the current SQLite implementation.

## 9. Privacy, Safety, and Fairness

- Demonstration data is fictional.
- Allocation factors and explanations are available for review.
- Usage limits should follow institutional policy.
- Eligibility and training requirements must be enforced.
- Booking approval and recovery decisions require authorised review.
- Scoring weights are prototype assumptions and should be validated before real-world deployment.

## 10. Known Limitations

- SQLite is used for the current workflow implementation; PostgreSQL integration is not established by these tests.
- Notification data generation is implemented, but external notification delivery is not established.
- The allocation and workflow tests do not prove every API edge case or concurrent-booking scenario is safe.
- Production deployment requires authentication, authorisation, stronger concurrency protection, and broader integration testing.
- Replacement selection currently uses resource category and availability rather than distance or advanced compatibility scoring.

## 11. Future Improvements

- Integrate with the team's final database and application architecture.
- Add comprehensive API integration and concurrent-booking tests.
- Improve replacement selection using distance and resource compatibility.
- Validate allocation weights and usage caps with institutional policies.
- Add production authentication, authorisation, monitoring, and notification delivery.
