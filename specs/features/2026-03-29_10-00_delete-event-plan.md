# Implementation Plan: Delete Event

**Spec:** `specs/features/2026-03-29_10-00_delete-event.md`
**Date:** 2026-03-29

---

## Summary

Add the ability for admins to delete draft events from the Event Detail page. Backend endpoint with status guard, frontend button with confirmation dialog, redirect on success.

---

## 1. Backend — Service Layer

**File:** `server/src/services/eventService.js`

Add a `remove(id)` method:
- Find event by PK (attributes: `id`, `status`)
- If not found: throw 404
- If `event.status !== 'draft'`: throw 409 "Only draft events can be deleted"
- Call `event.destroy()` — CASCADE handles related records (teams, criteria, scores, event_judges, team_comments — already configured in migrations)

No transaction needed — single destroy call, CASCADE is at the DB level.

---

## 2. Backend — Controller

**File:** `server/src/controllers/eventController.js`

Add a `deleteEvent` handler following the existing thin-controller pattern:
```js
const deleteEvent = async (req, res, next) => {
  try {
    await eventService.remove(req.params.id);
    res.json({ data: { message: 'Event deleted successfully' }, error: null });
  } catch (err) {
    next(err);
  }
};
```

Returns 200 with message per the spec (not 204) to match the API contract.

---

## 3. Backend — Route

**File:** `server/src/routes/eventRoutes.js`

Add one line:
```js
router.delete('/:id', requireRole('admin'), eventController.deleteEvent);
```

Auth middleware is already applied at the router level. `requireRole('admin')` handles the 403 case. No input validation needed — only param is `:id`.

---

## 4. Frontend — Event Service

**File:** `client/src/services/eventService.js`

Add:
```js
export const deleteEvent = async (id) => {
  const response = await api.delete(`/events/${id}`);
  return response.data.data;
};
```

---

## 5. Frontend — Event Detail Page

**File:** `client/src/pages/EventDetailPage.jsx`

Changes:
1. Import `useNavigate`, `ConfirmDialog`, and `deleteEvent` service
2. Add state: `showDeleteConfirm` (boolean), `isDeleting` (boolean), `deleteError` (string|null)
3. Add delete button at the bottom of the page, **after** the `ScoringCriteriaSection`, visible only when `isAdmin && event.status === 'draft'`
4. On button click: set `showDeleteConfirm = true`
5. Render `ConfirmDialog` when `showDeleteConfirm` is true:
   - title: "Delete Event"
   - message: "Are you sure you want to delete this event? This will permanently remove all teams, criteria, scores, and judge assignments."
   - confirmLabel: "Delete"
   - cancelLabel: "Cancel"
   - variant: "danger"
6. On confirm: call `deleteEvent(id)`, set `isDeleting = true`, on success `navigate('/')`
7. On error: show inline error below the delete button
8. While deleting: disable both modal buttons (Cancel disabled, Delete in loading state)

### Button placement

Per the spec: "Placed below the last section (Scoring Criteria), separated by spacing." The delete button goes after `ScoringCriteriaSection` with `mt-6` spacing, using the existing `Button` component with `variant="danger"`.

### ConfirmDialog loading state

The existing `ConfirmDialog` doesn't support loading/disabled states on its buttons. **Tradeoff:**

**Option A:** Extend `ConfirmDialog` to accept `isLoading` and `isDisabled` props, passing them through to the `Button` components. This follows the spec requirement that the Delete button shows loading state and Cancel is disabled during deletion.

**Option B:** Keep `ConfirmDialog` as-is and handle the async call outside the dialog (close dialog immediately on confirm, show loading on the page-level delete button). Simpler but doesn't match the spec's in-modal loading UX.

**Recommendation:** Option A — it's a small, backwards-compatible change (two optional props) and matches the spec exactly.

---

## 6. Files Changed (Summary)

| # | File | Change |
|---|------|--------|
| 1 | `server/src/services/eventService.js` | Add `remove()` method |
| 2 | `server/src/controllers/eventController.js` | Add `deleteEvent` handler |
| 3 | `server/src/routes/eventRoutes.js` | Add DELETE route |
| 4 | `client/src/services/eventService.js` | Add `deleteEvent()` |
| 5 | `client/src/components/ConfirmDialog.jsx` | Add `isLoading`/`isDisabled` props |
| 6 | `client/src/pages/EventDetailPage.jsx` | Delete button, dialog, state |

No migrations needed — CASCADE is already configured.

---

## 7. Error Handling

| Scenario | HTTP | Handled by |
|----------|------|------------|
| Not authenticated | 401 | `auth` middleware |
| Not an admin | 403 | `requireRole('admin')` |
| Event not found | 404 | `eventService.remove()` |
| Event not in draft | 409 | `eventService.remove()` |
| Unexpected error | 500 | `errorHandler` middleware |

Frontend maps API errors to user-facing messages inline below the delete button.

---

## 8. Out of Scope (confirmed)

- No soft delete / archiving
- No undo
- No deletion of non-draft events
- No delete from event list page
- No batch delete
- No new migration
