# Feature: Team Management (within Event)

> **Status:** Spec finalized
> **Date:** 2026-03-24
> **Author:** Product session (Claude)

---

## Problem Statement

After creating an event, the admin has no way to register the teams that will present at demo day. Without teams, there's nothing for judges to score. Team management is a prerequisite for the entire judging flow.

---

## User Stories

- As an **admin**, I want to add teams to my event so that judges know who is presenting.
- As an **admin**, I want to edit a team's details (name, members, links) so I can correct mistakes or update info as it changes.
- As an **admin**, I want to remove a team from an event so I can handle cancellations or errors.
- As an **admin**, I want to see all teams at a glance on the event detail page so I can verify everything is set before going live.
- **Edge case:** As an admin, I try to add a team with a name that already exists in this event — I should see a clear validation error.

---

## Data Model: `teams`

| Field                  | Type         | Constraints                          |
| ---------------------- | ------------ | ------------------------------------ |
| `id`                   | UUID         | PK, auto-generated                   |
| `event_id`             | UUID         | FK → events, required, ON DELETE CASCADE |
| `name`                 | STRING(100)  | Required, unique per event (composite unique: event_id + name) |
| `members`              | TEXT         | Required, free-text (comma-separated or one per line) |
| `demo_presentation_url`| STRING(500)  | Optional, must be valid URL if provided |
| `live_app_url`         | STRING(500)  | Optional, must be valid URL if provided |
| `created_at`           | TIMESTAMP    | Auto                                 |
| `updated_at`           | TIMESTAMP    | Auto                                 |

**Relationship:** Event has many Teams. Team belongs to one Event.

**Decisions:**
- Members stored as free-text (not structured JSON or separate table) — simplest for MVP, can migrate later if per-member features are needed.
- No team limit per event.

---

## API Endpoints

| Method   | Route                               | Description               | Auth  |
| -------- | ----------------------------------- | ------------------------- | ----- |
| `GET`    | `/api/events/:eventId/teams`        | List all teams for event  | Admin |
| `POST`   | `/api/events/:eventId/teams`        | Add a team to event       | Admin |
| `PUT`    | `/api/events/:eventId/teams/:teamId`| Update a team             | Admin |
| `DELETE` | `/api/events/:eventId/teams/:teamId`| Remove a team             | Admin |

**Response envelope** (per project convention):
```json
{ "data": ..., "error": null }
{ "data": null, "error": "message" }
```

**Status lock:** POST, PUT, and DELETE endpoints must reject requests with `403` if the event status is not `draft`. Response: `{ "data": null, "error": "Teams can only be modified while the event is in draft status" }`.

---

## Acceptance Criteria

- [ ] **Add team:** Admin can add a team with name (required), members (required), presentation URL (optional), live app URL (optional)
- [ ] **Inline validation:** Name and members validate on blur; URLs validate format on blur
- [ ] **Duplicate name:** Adding a team with a name already used in this event shows an inline error
- [ ] **Team list:** All teams for the event display in a card/row layout on the Event Detail page below the event info
- [ ] **Edit team:** Admin can click to edit any team's details via an inline form
- [ ] **Delete team:** Admin can remove a team; a confirmation dialog appears before deletion
- [ ] **Status lock:** Add/edit/delete actions are disabled (hidden or greyed out) when event status is "active" or "completed"; backend enforces this with 403
- [ ] **Empty state:** When no teams exist, show: "No teams yet — add your first team" with an "Add Team" CTA
- [ ] **Loading state:** Skeleton placeholders while teams are being fetched
- [ ] **Error state (fetch):** "Couldn't load teams" with a "Try again" retry button
- [ ] **Error state (save):** Inline error message above the form
- [ ] **URL links:** Presentation and live app URLs render as clickable external links (open in new tab)
- [ ] **Team count:** Number of teams visible in the section header (e.g., "Teams (3)")

---

## UI/UX Notes

### Event Detail Page — Updated Layout

1. Event header (name + status badge) — _exists_
2. Event info card (date, time limit, description) — _exists_
3. **NEW: Teams section** — below the event info card

### Teams Section

- **Section header:** "Teams (N)" + "Add Team" button (hidden when event is not draft)
- **Team cards** in a vertical list

### Team Card Displays

- Team name (prominent, bold)
- Members list (secondary text)
- Presentation link icon/button (if URL provided, external link)
- Live app link icon/button (if URL provided, external link)
- Edit / Delete action buttons (visible only when event is draft)

### Add/Edit Team Form

- Inline expandable form at the top of the team list (not a separate page)
- Fields:
  - **Name** — text input, required
  - **Members** — textarea, required (free-text: comma-separated or one per line)
  - **Presentation URL** — text input, optional, validated as URL
  - **Live App URL** — text input, optional, validated as URL
- **Buttons:** Cancel / Save
- Inline validation on blur

### States

| State              | Behavior                                                              |
| ------------------ | --------------------------------------------------------------------- |
| **Empty**          | Message: "No teams yet — add your first team" + Add Team CTA button  |
| **Loading**        | Skeleton rows matching team card shape                                |
| **Error (fetch)**  | "Couldn't load teams." + [Try again] button                          |
| **Error (save)**   | Inline error above the form                                          |
| **Delete confirm** | Dialog: "Remove {team name}? This can't be undone." + Cancel / Remove |

### Responsive Behavior

- **Desktop:** Team cards in a clean vertical list, actions visible
- **Mobile:** Cards stack full-width, action buttons collapse into a kebab/overflow menu

### Accessibility

- Form inputs have associated labels
- Delete confirmation is a focus-trapped dialog
- Keyboard navigable: Tab through team list, Enter to edit, Delete key or button to remove
- ARIA: live region for team count updates, `role="dialog"` on delete confirmation

---

## Out of Scope

- Drag-and-drop reordering of teams (presentation order)
- Team logos or images
- Assigning teams to specific time slots
- Bulk import of teams (CSV, etc.)
- Judge or Viewer visibility of teams (tied to future role-based access)
- Team self-registration
- Per-member structured data or certificates
