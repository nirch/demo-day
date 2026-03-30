## Feature: Team Presentation Order

### Problem Statement
Admins set up events with multiple teams, but the teams currently display in creation order. On demo day, the presentation order matters — judges and viewers need to see teams in the order they'll actually present. Without this, there's a disconnect between the app and the real-world event flow.

### User Stories
- As an **admin**, I want to reorder teams within an event so that the list reflects the actual presentation order.
- As a **judge**, I want to see teams in presentation order so I can follow along during the event.
- As an **admin**, I want reordering restricted to draft status so that the order is locked once the event goes live.
- *(Edge case)* As an **admin**, when I add a new team after reordering, I expect it to appear at the end of the list.

### Acceptance Criteria
- [ ] Teams display in `sort_order` ASC (not creation date) everywhere teams are listed
- [ ] Each team card shows up/down chevron buttons (matching criteria card pattern)
- [ ] Up button hidden on the first team; down button hidden on the last team
- [ ] Reorder buttons only visible when event status is `draft`
- [ ] Reordering persists immediately via API call
- [ ] Newly created teams receive the next `sort_order` value (appended to end)
- [ ] Deleting a team does not break ordering (remaining teams keep their relative order)
- [ ] Judges and viewers see teams in the admin-defined order

### UI/UX Notes
- **Pattern:** Identical to `CriteriaCard` chevron buttons — same icon, same placement, same interaction
- **Placement:** Up/down arrows on the left side of each `TeamCard` (or matching wherever criteria puts them)
- **States:**
  - *Default:* Arrows visible, clickable
  - *Boundary:* First item hides up; last item hides down
  - *Non-draft:* Arrows hidden entirely
  - *Loading:* Optimistic reorder (swap locally, revert on error)
- **Empty state:** No change needed (no arrows when 0-1 teams)
- **Error state:** If reorder API fails, revert to previous order and show a toast/notification
- **Responsive:** Arrows should remain accessible on mobile (touch targets >= 44px)
- **Accessibility:** `aria-label="Move team up"` / `"Move team down"`, buttons are focusable and keyboard-operable

### Technical Notes (for dev handoff)
- Add `sort_order` INTEGER NOT NULL DEFAULT 0 to `teams` table (new migration)
- Backfill existing teams: set `sort_order` based on current `created_at` ASC order
- New endpoint: `PUT /api/events/:eventId/teams/reorder` with body `{ "orderedIds": [...] }`
- Reorder service logic mirrors `criteriaService.reorder()` — validate IDs, update in transaction
- Update `teamService.getAll()` to order by `sort_order ASC`
- On team creation, assign `sort_order = MAX(sort_order) + 1` for the event
- Reorder validation: `orderedIds` must be non-empty array of valid UUIDs matching event's teams exactly

### Out of Scope
- Drag-and-drop reordering (future enhancement)
- Viewer-facing presentation mode / slideshow order
- Automatic ordering by score or other computed field
- Reordering after event leaves draft status

### Open Questions
None — this is a direct parallel to the existing criteria ordering pattern, so decisions are already established.
