# Team Management — Implementation Plan

## Context

After creating an event, the admin currently has no way to register teams that will present at demo day. This feature adds full CRUD for teams within an event, scoped to draft-status events. It's a prerequisite for the judging flow.

Spec: `specs/features/2026-03-24_11-59_team-management.md`

---

## 1. Database Migration

**New file:** `server/src/migrations/20260324000001-create-teams.js`

Creates `teams` table:
- `id` — UUID, PK, auto-generated
- `event_id` — UUID, FK → events(id), NOT NULL, ON DELETE CASCADE
- `name` — STRING(100), NOT NULL
- `members` — TEXT, NOT NULL
- `demo_presentation_url` — STRING(500), nullable
- `live_app_url` — STRING(500), nullable
- `created_at`, `updated_at` — timestamps

Indexes:
- Composite unique on (`event_id`, `name`)
- Index on `event_id` (for FK lookups)

`down` drops the table.

---

## 2. Sequelize Model

**New file:** `server/src/models/Team.js`

Fields mirror the migration. Follows the existing pattern from `Event.js` (factory function receiving `sequelize`).

**Update:** `server/src/models/index.js`
- Import Team model
- Add associations: `Event.hasMany(Team, { foreignKey: 'event_id', as: 'teams' })` and `Team.belongsTo(Event, { foreignKey: 'event_id', as: 'event' })`

---

## 3. Backend Validators

**New file:** `server/src/validators/teamValidators.js`

Using express-validator (same pattern as `eventValidators.js`):

`createTeamValidators` / `updateTeamValidators`:
- `name` — required, trimmed, max 100 chars
- `members` — required, trimmed
- `demo_presentation_url` — optional, valid URL if provided
- `live_app_url` — optional, valid URL if provided

---

## 4. Team Service

**New file:** `server/src/services/teamService.js`

Methods:
- `findAllByEvent(eventId)` — returns all teams for an event, ordered by `created_at ASC`, explicit attributes
- `create(eventId, data)` — creates team, handles unique constraint violation (duplicate name → friendly error)
- `update(teamId, eventId, data)` — updates team, handles unique constraint
- `remove(teamId, eventId)` — deletes team, returns boolean success

Each write method will first check the event's status and reject if not `draft` (403).

---

## 5. Team Controller

**New file:** `server/src/controllers/teamController.js`

Thin handlers following `eventController.js` pattern:
- `listTeams` — GET, returns `{ data: teams, error: null }`
- `createTeam` — POST, returns 201
- `updateTeam` — PUT, returns updated team
- `deleteTeam` — DELETE, returns 204

404 handling for team/event not found. 403 for status lock.

---

## 6. Team Routes

**New file:** `server/src/routes/teamRoutes.js`

Mounted at `/api/events/:eventId/teams` (nested under events in `app.js`).

All routes require `auth` + `requireRole('admin')`:
- `GET /` → `teamController.listTeams`
- `POST /` → `createTeamValidators` + `validate` + `teamController.createTeam`
- `PUT /:teamId` → `updateTeamValidators` + `validate` + `teamController.updateTeam`
- `DELETE /:teamId` → `teamController.deleteTeam`

**Update:** `server/src/app.js` — mount team routes with `mergeParams: true` on the router so `req.params.eventId` is accessible.

---

## 7. Frontend API Service

**New file:** `client/src/services/teamService.js`

Functions (using existing `api` axios instance from `services/api.js`):
- `getTeams(eventId)` — GET `/api/events/${eventId}/teams`
- `createTeam(eventId, payload)` — POST
- `updateTeam(eventId, teamId, payload)` — PUT
- `deleteTeam(eventId, teamId)` — DELETE

---

## 8. Frontend Components

### 8a. TeamSection (`client/src/components/TeamSection.jsx`)
Top-level container rendered on `EventDetailPage`. Manages:
- Fetch teams on mount (loading/error/empty states)
- "Teams (N)" header + "Add Team" button (hidden if event not draft)
- Renders `TeamCard` list or empty state
- Manages add/edit form visibility state

### 8b. TeamCard (`client/src/components/TeamCard.jsx`)
Displays a single team:
- Name (bold), members (secondary text)
- URL links as icon buttons (external, new tab)
- Edit/Delete buttons (visible only when event is draft)
- Edit click → switches card to inline `TeamForm`

### 8c. TeamForm (`client/src/components/TeamForm.jsx`)
Inline form for add/edit:
- Uses existing `useForm` hook
- Fields: name (Input), members (TextArea), presentation URL (Input), live app URL (Input)
- Validation on blur: name required, members required, URLs validated with regex
- Cancel/Save buttons
- Shows server errors inline above form
- On save success → collapses form, refreshes list

### 8d. ConfirmDialog (`client/src/components/ConfirmDialog.jsx`)
Reusable confirmation modal:
- Focus-trapped, `role="dialog"`, `aria-modal="true"`
- Props: `title`, `message`, `confirmLabel`, `onConfirm`, `onCancel`, `variant` (danger)
- Used for delete confirmation: "Remove {team name}? This can't be undone."

### 8e. Button update (`client/src/components/Button.jsx`)
Add `danger` variant to the existing variants map (per design system: transparent bg, red-600 text, red-200 border, hover red-50).

---

## 9. EventDetailPage Update

**Modify:** `client/src/pages/EventDetailPage.jsx`

Add `<TeamSection eventId={id} eventStatus={event.status} />` below the event info card. Pass `eventStatus` so the section knows whether to show edit controls.

---

## File Summary

| Action | Path |
|--------|------|
| Create | `server/src/migrations/20260324000001-create-teams.js` |
| Create | `server/src/models/Team.js` |
| Modify | `server/src/models/index.js` |
| Create | `server/src/validators/teamValidators.js` |
| Create | `server/src/services/teamService.js` |
| Create | `server/src/controllers/teamController.js` |
| Create | `server/src/routes/teamRoutes.js` |
| Modify | `server/src/app.js` (mount team routes) |
| Create | `client/src/services/teamService.js` |
| Create | `client/src/components/TeamSection.jsx` |
| Create | `client/src/components/TeamCard.jsx` |
| Create | `client/src/components/TeamForm.jsx` |
| Create | `client/src/components/ConfirmDialog.jsx` |
| Modify | `client/src/components/Button.jsx` (add danger variant) |
| Modify | `client/src/pages/EventDetailPage.jsx` (add TeamSection) |

---

## Implementation Order

1. Migration + Model (backend data layer)
2. Validators
3. Service + Controller + Routes (backend API)
4. Frontend service (API layer)
5. Button danger variant + ConfirmDialog (reusable pieces)
6. TeamForm component
7. TeamCard component
8. TeamSection component
9. EventDetailPage integration

---

## Verification

1. **Run migration:** `npx sequelize-cli db:migrate` — confirm `teams` table created
2. **API smoke test:** Use curl or the app to:
   - POST a team to a draft event → 201
   - POST a duplicate name → 400 with validation error
   - GET teams for the event → list with 1 team
   - PUT to update the team → 200
   - DELETE the team → 204
   - POST a team to a non-draft event → 403
3. **Frontend manual test:**
   - Navigate to an event detail page → see "No teams yet" empty state
   - Click "Add Team" → form appears inline
   - Fill in name + members → Save → card appears
   - Click edit → form pre-filled → update → card updates
   - Click delete → confirmation dialog → confirm → card removed
   - Verify URL links open in new tab
   - Verify form validation on blur (empty name, invalid URL)
   - Verify add/edit/delete hidden when event is not draft
