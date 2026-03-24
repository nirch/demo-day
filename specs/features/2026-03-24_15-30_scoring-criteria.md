## Feature: Scoring Criteria per Event

### Problem Statement

Judges need a structured, consistent framework to evaluate team demos. Without predefined criteria, scoring becomes subjective and inconsistent across judges. Admins need the flexibility to tailor evaluation criteria per event while benefiting from sensible defaults that require zero configuration for the common case.

### User Stories

- As an **Admin**, I want events to come with default scoring criteria so that I don't have to set them up manually every time.
- As an **Admin**, I want to add, edit, or remove criteria for a specific event so that I can tailor evaluation to that cohort's focus.
- As an **Admin**, I want each criterion to have a description so that judges understand what they're evaluating.
- As an **Admin**, I want to reorder criteria so that the most important ones appear first on the judging form.
- As an **Admin**, I expect criteria editing to be locked once the event is live, so scores remain consistent.
- As a **Judge**, I want to see clear criteria names and descriptions so I know exactly what to score.

### Default Criteria

These are seeded automatically when an event is created. The admin is **not** prompted or nudged to change them — they simply work out of the box.

| # | Name                          | Description                                              |
|---|-------------------------------|----------------------------------------------------------|
| 1 | Technical Complexity          | Ambition and difficulty of the technical implementation   |
| 2 | Product Quality               | Completeness, polish, does it solve the stated problem    |
| 3 | UI/UX Design                  | Visual design, usability, interaction quality             |
| 4 | Presentation & Communication  | Demo clarity, storytelling, time management               |
| 5 | Innovation & Creativity       | Originality of idea or approach                           |

- Score range: **1** (lowest) to **5** (highest)
- All criteria have **equal weight** (no weighting system in MVP)

### Acceptance Criteria

- [ ] When an event is created, the 5 default criteria are automatically attached to it
- [ ] Admin can view the list of criteria for an event on the event detail page
- [ ] Admin can add a new criterion (name + description) to an event
- [ ] Admin can edit an existing criterion's name and description
- [ ] Admin can delete a criterion from an event
- [ ] Admin can reorder criteria (drag-and-drop or up/down controls)
- [ ] Criteria management is only available when event status is `draft`
- [ ] Add/edit/delete/reorder controls are hidden when event is not in `draft`
- [ ] Criterion name is required, max 100 characters
- [ ] Criterion description is optional, max 255 characters
- [ ] Criterion names must be unique within an event
- [ ] Minimum 1 criterion per event — the last criterion cannot be deleted
- [ ] Default criteria are independent per event (editing criteria on one event does not affect others)
- [ ] Score range (1–5) is system-defined and not editable by the admin

### Data Model

**Table: `criteria`**

| Column        | Type         | Constraints                          |
|---------------|-------------|--------------------------------------|
| id            | UUID         | PK, default gen                      |
| event_id      | UUID         | FK → events.id, ON DELETE CASCADE    |
| name          | VARCHAR(100) | NOT NULL                             |
| description   | VARCHAR(255) | NULL                                 |
| sort_order    | INTEGER      | NOT NULL, default 0                  |
| created_at    | TIMESTAMP    | NOT NULL                             |
| updated_at    | TIMESTAMP    | NOT NULL                             |

- Unique constraint: `(event_id, name)`
- Index on `event_id`

### API Endpoints

All nested under `/api/events/:eventId/criteria`. All require auth + admin role.

| Method | Path                              | Description            | Status |
|--------|-----------------------------------|------------------------|--------|
| GET    | `/api/events/:eventId/criteria`   | List criteria for event | 200    |
| POST   | `/api/events/:eventId/criteria`   | Add a criterion         | 201    |
| PUT    | `/api/events/:eventId/criteria/:criterionId` | Update a criterion | 200 |
| DELETE | `/api/events/:eventId/criteria/:criterionId` | Delete a criterion | 204 |
| PUT    | `/api/events/:eventId/criteria/reorder` | Reorder criteria   | 200    |

**POST/PUT body:**
```json
{ "name": "Technical Complexity", "description": "Ambition and difficulty..." }
```

**PUT /reorder body:**
```json
{ "orderedIds": ["uuid-1", "uuid-3", "uuid-2", "uuid-4", "uuid-5"] }
```

**Response envelope** (per project convention):
```json
{ "data": [...], "error": null }
```

**Error cases:**
- 404 — Event not found
- 403 — Event is not in draft status
- 409 — Duplicate criterion name within event
- 422 — Validation errors (empty name, name too long)
- 400 — Cannot delete last criterion

### UI/UX Notes

**Location:** Event detail page, new "Scoring Criteria" section below the Teams section.

**Section layout:**
- Header: "Scoring Criteria (N)" with "Add Criterion" button (visible only in draft)
- List of criteria cards ordered by `sort_order`
- Each card shows: name, description (muted text), reorder handle, edit/delete buttons

**States:**

| State    | Behavior                                                        |
|----------|-----------------------------------------------------------------|
| Default  | List of criteria cards with name + description                  |
| Empty    | Not reachable in normal flow (defaults are seeded on creation). Defensive message: "No criteria defined. Add at least one criterion." |
| Loading  | Skeleton cards matching criteria card dimensions                |
| Error    | Inline alert above the list: "Failed to load criteria. Please try again." with retry |
| Draft    | Full edit controls visible (add, edit, delete, reorder)         |
| Non-draft| Cards displayed read-only, no edit controls, no "Add" button    |

**Add/Edit form:**
- Inline form (same pattern as TeamForm)
- Fields: Name (required, text input), Description (optional, text input)
- Validation: inline on blur, name required + max 100, description max 255
- Server error displayed as inline alert

**Delete behavior:**
- Confirmation dialog (reuse ConfirmDialog component)
- Message: "Delete criterion '{name}'? This cannot be undone."
- Blocked if it's the last criterion — show toast/alert: "An event must have at least one scoring criterion."

**Reorder behavior:**
- Up/down arrow buttons on each card (simpler than drag-and-drop for MVP)
- First item hides "up" button, last item hides "down" button
- Reorder persisted on each move (call reorder endpoint)

**No nudging:**
- The criteria section is displayed matter-of-factly alongside teams
- No banners, tooltips, or prompts suggesting the admin should customize criteria
- Defaults just work silently

**Responsive:**
- Desktop: criteria cards in a single column list (consistent with team cards)
- Mobile: full-width cards, touch-friendly reorder buttons

**Accessibility:**
- Reorder buttons have aria-labels: "Move {name} up", "Move {name} down"
- List uses `role="list"`, cards use `role="listitem"`
- Delete confirmation is focus-trapped dialog
- Form labels associated with inputs

### Out of Scope

- Score weighting (all criteria are equal weight)
- Judging flow / score submission (separate feature)
- Score display / aggregation / results
- Global default criteria management (defaults are hardcoded; admin edits per-event only)
- Drag-and-drop reordering (using up/down buttons for MVP)
- Criteria categories or grouping

### Open Questions

None — all decisions resolved.
