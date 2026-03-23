# Feature: Event Creation + Project Scaffold

> **Status:** Ready for implementation
> **Created:** 2026-03-23
> **Scope:** Admin auth, event CRUD (create + read only), full-stack project scaffold

---

## Problem Statement

Admins need a way to create and view demo day events — the foundational entity of the platform. Without events, nothing else (teams, judges, scoring) can exist. This feature also establishes the full-stack project structure, auth flow, and data layer.

---

## User Stories

- As an admin, I want to log in with my email and password so that I can access the platform securely
- As an admin, I want to create a new event with a name, date, and time limit so that I can set up an upcoming demo day
- As an admin, I want to see a list of all my events so that I can track upcoming and past demo days
- As an admin, I want to view an event's details so that I can confirm its configuration
- As an admin who enters an invalid date or missing name, I want to see inline validation errors so that I can fix my input before submitting

---

## Acceptance Criteria

### Auth

- [ ] Admin can log in with email + password
- [ ] Invalid credentials show a clear error message
- [ ] JWT is issued on login and stored client-side
- [ ] Protected routes redirect to login if no valid token
- [ ] No signup flow — admin users are seeded/managed manually

### Event Creation

- [ ] Admin can create an event with: name (required), date (required), description (optional), time limit per demo (required, default 7 min)
- [ ] New events are created with status `draft` by default
- [ ] Name must be non-empty; date must be today or future; time limit must be 1–60 minutes
- [ ] Validation errors appear inline on the form
- [ ] On success, admin is redirected to the event list

### Event List

- [ ] Admin sees all events, sorted by date descending
- [ ] Each event card shows: name, date, status badge, time limit
- [ ] Status is visually distinct per state (see Status Visual Treatment below)
- [ ] Empty state shown when no events exist

### Event Detail

- [ ] Admin can click an event to see its full details
- [ ] Detail view shows: name, date, description, status, time limit

---

## UI/UX Notes

### Screens

1. **Login** — email + password form, error state for invalid credentials
2. **Event List (Dashboard)** — card grid/list of events, empty state with CTA to create
3. **Create Event** — form with inline validation
4. **Event Detail** — read-only detail view

### Event List — Status Visual Treatment

Each event card has a **status badge** (pill-shaped label) and a **subtle left border accent** to make status scannable at a glance:

| Status    | Badge Label | Badge Style                            | Card Left Border     |
|-----------|-------------|----------------------------------------|----------------------|
| Draft     | `Draft`     | Muted/neutral (gray bg, dark text)     | Gray                 |
| Active    | `Live`      | Bold/primary (accent bg, white text)   | Accent/primary color |
| Completed | `Completed` | Subdued/success (green-tinted bg, dark text) | Green-tinted   |

**Design rationale:**
- Full card background tints make text harder to read and clash with dark/light themes
- A left border gives instant visual grouping when scanning a list
- The badge gives an explicit, accessible label (not color-dependent)

### States Per Screen

| Screen       | Empty                                          | Loading                        | Error                                      | Success                |
|--------------|------------------------------------------------|--------------------------------|--------------------------------------------|------------------------|
| Login        | N/A                                            | Submit button disabled + spinner | "Invalid email or password" inline        | Redirect to event list |
| Event List   | "No events yet. Create your first one." + CTA  | Skeleton cards                 | "Failed to load events. Try again." + retry | Card list              |
| Create Event | Pre-filled defaults (time limit = 7)           | Submit button disabled + spinner | Inline field errors                       | Redirect to event list |
| Event Detail | N/A                                            | Skeleton layout                | "Event not found" or "Failed to load"      | Full detail view       |

### Responsive

- Mobile: single-column layout, full-width cards and forms
- Desktop: centered content with max-width constraint

### Accessibility

- Login form: proper `label` + `input` association, `aria-invalid` on error fields
- Event list: semantic list markup, focusable cards
- Forms: focus moves to first error field on validation failure
- Status is conveyed by badge text, not color alone
- Badges use sufficient contrast ratios against their backgrounds

---

## Data Model

### User (Admin)

| Column     | Type      | Constraints          |
|------------|-----------|----------------------|
| id         | UUID      | PK                   |
| email      | string    | unique, not null     |
| password   | string    | hashed, not null     |
| role       | enum      | `admin` (only role for now) |
| created_at | timestamp |                      |
| updated_at | timestamp |                      |

### Event

| Column      | Type    | Constraints                                       |
|-------------|---------|---------------------------------------------------|
| id          | UUID    | PK                                                |
| name        | string  | not null                                          |
| description | text    | nullable                                          |
| date        | date    | not null                                          |
| status      | enum    | `draft`, `active`, `completed` — default `draft`  |
| time_limit  | integer | not null, default 7, range 1–60 (minutes)         |
| created_by  | UUID    | FK → User                                         |
| created_at  | timestamp |                                                 |
| updated_at  | timestamp |                                                 |

---

## API Endpoints

| Method | Path              | Description       | Auth         |
|--------|-------------------|--------------------|-------------|
| POST   | `/api/auth/login` | Login, returns JWT | No           |
| GET    | `/api/events`     | List all events    | Yes          |
| POST   | `/api/events`     | Create event       | Yes (admin)  |
| GET    | `/api/events/:id` | Get event detail   | Yes          |

### Response Envelope

All responses follow the project convention:

```json
{ "data": ..., "error": null }
{ "data": null, "error": "message" }
```

---

## Out of Scope

- Admin signup / registration
- Edit or delete events
- Judge or viewer roles
- Team management within events
- Any scoring functionality
- Email/invite flows

---

## Open Questions

None — all decisions resolved. Ready for implementation.
