# Implementation Plan: Team Presentation Order

**Spec:** `specs/features/2026-03-30_10-00_team-presentation-order.md`
**Date:** 2026-03-30
**Pattern source:** Criteria ordering (migration, service, controller, route, validators, CriteriaCard chevrons, ScoringCriteriaSection handlers)

---

## 1. Database Migration — Add `sort_order` to `teams`

**File:** `server/src/migrations/YYYYMMDDHHMMSS-add-sort-order-to-teams.js`

- Add `sort_order` INTEGER NOT NULL DEFAULT 0 to `teams` table
- Backfill existing rows: set `sort_order` based on `created_at` ASC order per event (using raw SQL with `ROW_NUMBER() OVER (PARTITION BY event_id ORDER BY created_at ASC)`)
- `down`: remove the `sort_order` column

**Tradeoff:** The backfill uses a raw SQL `UPDATE ... FROM` with window function. PostgreSQL-only, which matches our stack.

---

## 2. Update Team Model

**File:** `server/src/models/Team.js`

- Add `sort_order` field: `{ type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }`

---

## 3. Backend Service — Reorder + Sort + Auto-assign

**File:** `server/src/services/teamService.js`

### 3a. `reorder(eventId, orderedIds)`
Mirror `criteriaService.reorder()` exactly:
- Call `assertEventDraft(eventId)` (already imported in this file)
- Validate `orderedIds` matches the event's team IDs exactly
- Update each team's `sort_order` in a transaction
- Return the updated team list ordered by `sort_order ASC`

### 3b. Update `findAllByEvent()`
- Change `order` from `[['created_at', 'ASC']]` to `[['sort_order', 'ASC']]`

### 3c. Update `create()`
- On team creation, compute `MAX(sort_order) + 1` for the event and assign to the new team
- This ensures new teams append to the end

### 3d. No change needed for `delete()`
- Deleting a team leaves gaps in `sort_order` — this is fine; relative order is preserved (same as criteria pattern)

---

## 4. Backend Controller

**File:** `server/src/controllers/teamController.js`

- Add `reorderTeams` handler (thin — delegates to `teamService.reorder()`)
- Response: `{ data: teams, error: null }`

---

## 5. Backend Validators

**File:** `server/src/validators/teamValidators.js`

- Add `reorderTeamsValidators` array:
  - `body('orderedIds').isArray({ min: 1 })` — "orderedIds must be a non-empty array"
  - `body('orderedIds.*').isUUID()` — "Each ID must be a valid UUID"
- Export alongside existing validators

---

## 6. Backend Route

**File:** `server/src/routes/teamRoutes.js`

- Add `PUT /reorder` with `reorderTeamsValidators`, `validate`, `teamController.reorderTeams`
- Place **before** `/:teamId` routes to avoid route param collision

---

## 7. Client API Service

**File:** `client/src/services/teamService.js`

- Add `reorderTeams(eventId, orderedIds)` — `PUT /events/${eventId}/teams/reorder` with body `{ orderedIds }`

---

## 8. TeamCard Component — Add Chevron Buttons

**File:** `client/src/components/TeamCard.jsx`

- Add props: `onMoveUp`, `onMoveDown`, `isFirst`, `isLast`, `isDraft`
- When `isDraft`, render up/down chevron buttons matching CriteriaCard pattern exactly:
  - Same SVG icons, same button classes (`p-2 rounded-sm border border-border-card`)
  - Up button: `disabled` + hidden when `isFirst`
  - Down button: `disabled` + hidden when `isLast`
  - `aria-label="Move team up"` / `"Move team down"`
  - Placed in the card's action area alongside existing Edit/Remove buttons

---

## 9. TeamSection Component — Add Reorder Handlers

**File:** `client/src/components/TeamSection.jsx`

- Add `handleMoveUp(index)` and `handleMoveDown(index)` mirroring ScoringCriteriaSection:
  - Optimistic swap in local state
  - Call `teamService.reorderTeams(eventId, orderedIds)`
  - On error: refetch teams to revert
- Pass `onMoveUp`, `onMoveDown`, `isFirst`, `isLast`, `isDraft` props to each `TeamCard`
- Ensure teams are sorted by `sort_order` from the API response (should already be, but defensive sort on client is fine)

---

## File Change Summary

| # | File | Action |
|---|------|--------|
| 1 | `server/src/migrations/...-add-sort-order-to-teams.js` | **New** |
| 2 | `server/src/models/Team.js` | Edit — add `sort_order` |
| 3 | `server/src/services/teamService.js` | Edit — add `reorder()`, update `findAllByEvent()` sort, update `create()` |
| 4 | `server/src/controllers/teamController.js` | Edit — add `reorderTeams` |
| 5 | `server/src/validators/teamValidators.js` | Edit — add `reorderTeamsValidators` |
| 6 | `server/src/routes/teamRoutes.js` | Edit — add `PUT /reorder` |
| 7 | `client/src/services/teamService.js` | Edit — add `reorderTeams()` |
| 8 | `client/src/components/TeamCard.jsx` | Edit — add chevron buttons |
| 9 | `client/src/components/TeamSection.jsx` | Edit — add reorder handlers + pass props |

---

## Open Decisions

None — all patterns are established by the criteria ordering implementation. This is a direct replication.
