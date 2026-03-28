# Implementation Plan: Scoring Summary
**Spec:** `specs/features/2026-03-26_16-00_scoring-summary.md`
**Date:** 2026-03-28

---

## Architecture Decisions & Tradeoffs to Confirm

### Decision 1 — Admin endpoint can't live in `scoreRoutes.js`

`scoreRoutes.js` applies `router.use(requireRole('judge'))` globally at the router level. Adding an admin-only route there would require overriding that middleware per-route, which is non-standard and fragile.

**Recommendation:** Create a new `scoringsSummaryRoutes.js` that applies `requireRole('admin')` at the router level — clean separation of concerns, mirrors the `judgeInviteRoutes.js` admin/public pattern.

**Alternative:** Add the route directly to `eventRoutes.js`. Rejected — conflates event CRUD concerns with score reporting.

---

### Decision 2 — Single-pass data assembly (no N+1)

All data for the response is fetched in **6 flat queries**, then assembled in JS — no DB calls inside loops:

1. `Event.findByPk` — event name
2. `Criterion.findAll` — all criteria for event, sorted by `sort_order`
3. `Event.findByPk` with `judges` include (via `belongsToMany`) — all judges for event
4. `Team.findAll` — all teams for event
5. `Score.findAll` — all scores for event
6. `TeamComment.findAll` — all comments for event

Assembly (sort, group, compute averages) is all in-memory. This avoids N+1 and keeps the service function predictable regardless of team/judge counts.

---

### Decision 3 — Route protection in App.jsx

The scoring summary page is admin-only. Currently `<AdminRoute>` only wraps `/` and `/events/new`. Rather than restructuring the router, add a second `<Route element={<AdminRoute />}>` block inside the existing `<ProtectedRoute>/<Layout>` wrapper for the new route. This is the same pattern already used — no new component needed.

---

## Implementation Steps

### 1. Backend — Service: `getScoringsSummaryAdmin`

**File:** `server/src/services/scoreService.js` — add new export

```js
const getScoringsSummaryAdmin = async (eventId) => {
  const event = await Event.findByPk(eventId, { attributes: ['id', 'name'] });
  if (!event) {
    const err = new Error('Event not found');
    err.status = 404;
    throw err;
  }

  const [criteria, eventWithJudges, teams, allScores, allComments] = await Promise.all([
    Criterion.findAll({
      where: { event_id: eventId },
      attributes: ['id', 'name', 'sort_order'],
      order: [['sort_order', 'ASC']],
    }),
    Event.findByPk(eventId, {
      include: [{ model: User, as: 'judges', attributes: ['id', 'name'], through: { attributes: [] } }],
    }),
    Team.findAll({
      where: { event_id: eventId },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    }),
    Score.findAll({
      where: { event_id: eventId },
      attributes: ['team_id', 'criterion_id', 'judge_id', 'value'],
    }),
    TeamComment.findAll({
      where: { event_id: eventId },
      attributes: ['team_id', 'judge_id', 'comment'],
    }),
  ]);

  const judges = eventWithJudges.judges || [];
  const expectedPerTeam = criteria.length * judges.length;

  const teamsData = teams.map((team) => {
    const teamScores = allScores.filter((s) => s.team_id === team.id);
    const teamComments = allComments.filter((c) => c.team_id === team.id);
    const totalScores = teamScores.length;
    const sum = teamScores.reduce((acc, s) => acc + s.value, 0);
    const averageScore = totalScores > 0 ? Math.round((sum / totalScores) * 10) / 10 : null;

    return {
      id: team.id,
      name: team.name,
      averageScore,
      totalScores,
      expectedScores: expectedPerTeam,
      isComplete: expectedPerTeam > 0 && totalScores === expectedPerTeam,
      scores: teamScores.map((s) => ({
        criterionId: s.criterion_id,
        judgeId: s.judge_id,
        value: s.value,
      })),
      comments: teamComments.map((c) => ({
        judgeId: c.judge_id,
        comment: c.comment,
      })),
    };
  });

  // Sort: scored teams by averageScore desc, unscored at bottom
  teamsData.sort((a, b) => {
    if (a.averageScore === null && b.averageScore === null) return 0;
    if (a.averageScore === null) return 1;
    if (b.averageScore === null) return -1;
    return b.averageScore - a.averageScore;
  });

  return {
    event: { id: event.id, name: event.name },
    criteria: criteria.map((c) => ({ id: c.id, name: c.name, sortOrder: c.sort_order })),
    judges: judges.map((j) => ({ id: j.id, name: j.name })),
    teams: teamsData,
  };
};
```

**Note:** Requires adding `User` and `Team` to the existing destructure at the top of `scoreService.js`.

---

### 2. Backend — Controller: `getScoringsSummaryAdmin`

**File:** `server/src/controllers/scoreController.js` — add new handler

```js
const getScoringsSummaryAdmin = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const summary = await scoreService.getScoringsSummaryAdmin(eventId);
    res.json({ data: summary, error: null });
  } catch (err) {
    next(err);
  }
};
```

---

### 3. Backend — New Route File

**File:** `server/src/routes/scoringsSummaryRoutes.js` — create

```js
const { Router } = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const scoreController = require('../controllers/scoreController');

const router = Router({ mergeParams: true });

router.use(auth);
router.use(requireRole('admin'));

router.get('/scoring-summary', scoreController.getScoringsSummaryAdmin);

module.exports = router;
```

---

### 4. Backend — Mount in `app.js`

**File:** `server/src/app.js` — add one import and one `app.use` line

```js
const scoringsSummaryRoutes = require('./routes/scoringsSummaryRoutes');
// ...
app.use('/api/events/:eventId', scoringsSummaryRoutes);
```

Mount order: after `scoreRoutes`, before `errorHandler`. The existing `scoreRoutes` mount (`app.use('/api/events/:eventId', scoreRoutes)`) is unaffected — both use the same prefix and Express distinguishes them by path.

---

### 5. Frontend — Service Function

**File:** `client/src/services/scoreService.js` — add one export

```js
export const getScoringsSummary = async (eventId) => {
  const response = await api.get(`/events/${eventId}/scoring-summary`);
  return response.data.data;
};
```

---

### 6. Frontend — `ScoringsSummaryPage` Component

**File:** `client/src/pages/ScoringsSummaryPage.jsx` — create

This page exceeds ~150 lines due to the matrix table and team row expansion. It will be split into:

- `ScoringsSummaryPage.jsx` — data fetch, state, layout shell
- `client/src/components/TeamSummaryRow.jsx` — individual team row with expand/collapse and the breakdown matrix

**`ScoringsSummaryPage.jsx` — structure:**

```
Page state:
  - summaryData: null | { event, criteria, judges, teams }
  - isLoading: boolean
  - error: string | null
  - expandedTeamId: string | null  (one team expanded at a time)

On mount: getScoringsSummary(eventId) → setSummaryData

Layout:
  Back link → /events/:id
  <h1>: "{event.name} — Scoring Summary"

  Loading state: skeleton cards (3 rows)
  Error state: inline error + retry button
  Empty state: "No scores have been submitted yet." (all teams have totalScores === 0)

  Scored teams list:
    <ol> (ordered, for rank)
      each team → <TeamSummaryRow>
```

**`TeamSummaryRow.jsx` — structure:**

```
Props: team, criteria, judges, isExpanded, onToggle

Collapsed row (full-width card):
  Rank number (text-text-muted, text-sm)
  Team name (text-xl font-semibold tracking-tight)
  Average score: "{n} / 5" or "No scores"
  Completion badge:
    - "Complete" → bg-accent-subtle text-accent text-xs font-medium rounded-sm px-2 py-0.5
    - "Incomplete (n/m judges)" → bg-red-50 text-red-600 same sizing
  Chevron icon (right side, rotates when expanded)

Expanded section (revealed below the row header, same card):
  Score matrix table:
    - Horizontal scroll wrapper on mobile
    - Col headers: judge names (text-xs font-semibold uppercase tracking-[0.06em] text-text-muted)
    - Row headers: criterion names (same style, left-aligned)
    - Cells: score value (1–5) centered, or "—" (text-text-muted) if missing
    - Column fully missing (judge scored no criteria for team): column header flagged
      with "Missing" label below the name (text-xs text-red-500)
  Comments section (below matrix, only rendered if any comments exist):
    <h3>Comments</h3>
    For each comment: judge name label (bold) + comment text
```

---

### 7. Frontend — Add Route in `App.jsx`

**File:** `client/src/App.jsx`

Add a second `<Route element={<AdminRoute />}>` block alongside the existing one, inside `<ProtectedRoute>/<Layout>`:

```jsx
<Route element={<AdminRoute />}>
  <Route path="/events/:id/scoring-summary" element={<ScoringsSummaryPage />} />
</Route>
```

Import `ScoringsSummaryPage` at the top.

---

### 8. Frontend — Add "Scoring Summary" Link in `EventDetailPage`

**File:** `client/src/pages/EventDetailPage.jsx`

In the admin-only section (where `isAdmin` is true), add a link after the event details card and before `<InviteJudgeSection>`:

```jsx
{isAdmin && (
  <div className="mt-6">
    <Link
      to={`/events/${id}/scoring-summary`}
      className="
        inline-block bg-accent text-white
        text-md font-medium tracking-tight
        px-6 py-[11px] rounded-sm
        transition-colors duration-base
        hover:opacity-90
        focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
      "
    >
      View Scoring Summary
    </Link>
  </div>
)}
```

---

## File Change Summary

| File | Action |
|---|---|
| `server/src/services/scoreService.js` | Update — add `getScoringsSummaryAdmin` |
| `server/src/controllers/scoreController.js` | Update — add `getScoringsSummaryAdmin` handler |
| `server/src/routes/scoringsSummaryRoutes.js` | Create |
| `server/src/app.js` | Update — import and mount `scoringsSummaryRoutes` |
| `client/src/services/scoreService.js` | Update — add `getScoringsSummary` |
| `client/src/pages/ScoringsSummaryPage.jsx` | Create |
| `client/src/components/TeamSummaryRow.jsx` | Create |
| `client/src/App.jsx` | Update — add route |
| `client/src/pages/EventDetailPage.jsx` | Update — add "View Scoring Summary" link |

**No migrations needed.** All required tables (`scores`, `team_comments`, `criteria`, `teams`, `users`, `event_judges`) already exist.

---

## Open Questions for Review

1. **Promise.all in service** — fetching all 5 resources in parallel after the event check. All queries are reads with no interdependencies, so this is safe. Any concern?

2. **Rank display for tied teams** — spec says "ordered by average score descending." If two teams share the same average, they'll receive the same list position. Should ties show the same rank number (e.g. both "2") or sequential numbers? Current plan: sequential (list index), no special tie handling.

3. **Empty state threshold** — the spec says show the empty state if "no scores have been submitted for the entire event." Current plan: check if every team has `totalScores === 0`. Should this also trigger if there are no teams at all?
