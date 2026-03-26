# Implementation Plan: Team Scoring
**Spec:** `specs/features/2026-03-26_14-00_team-scoring.md`
**Date:** 2026-03-26

---

## Architecture Decisions & Tradeoffs to Confirm

### Decision 1 — "Has this team been scored?" on page load (N+1 risk)

The spec requires each TeamCard to show a "Scored" indicator on load. The only defined GET endpoint returns scores for one team at a time. Fetching per-team would be an N+1 problem.

**Recommendation:** Add a lightweight summary endpoint not in the spec:
```
GET /api/events/:eventId/teams/scores-summary
→ { data: { [teamId]: boolean }, error: null }
```
Returns which teams the requesting judge has scored. One query, one round trip. Called once when TeamSection mounts in judge mode.

**Alternative (avoid extra endpoint):** Track `scoredTeamIds` client-side after successful submissions only — no persistence across page reloads. Users would lose the indicator if they refresh. Not acceptable for production.

**Flagging this** because it adds an endpoint beyond the spec — worth confirming before building.

---

### Decision 2 — Criteria fetch in judge view

Currently, `ScoringCriteriaSection` fetches criteria but it's admin-only. The scoring modal needs event criteria. Two options:

**Option A (recommended):** Fetch criteria inside `TeamSection` when `isJudge=true`, pass down to modal. One extra `GET /api/events/:eventId/criteria` call when the section mounts. Reuses the existing public-to-judges endpoint (currently admin-only, needs to be opened to judges).

**Option B:** Fetch criteria lazily inside the scoring modal on open. Adds loading state to the modal.

Option A is cleaner — criteria are stable during a session and the modal benefits from pre-loaded data.

**Note:** `criteriaRoutes.js` currently restricts `GET /api/events/:eventId/criteria` to admin only. This needs to be opened to judges.

---

## Implementation Steps

### 1. Database — Migrations (2 new files)

**File:** `server/src/migrations/20260326000004-create-scores.js`
- Create `scores` table
- Columns: `id` (UUID PK), `event_id` (UUID, FK→events CASCADE), `team_id` (UUID, FK→teams CASCADE), `criterion_id` (UUID, FK→criteria CASCADE), `judge_id` (UUID, FK→users CASCADE), `value` (INTEGER, CHECK 1–5, NOT NULL), `created_at`, `updated_at`
- Unique constraint: `(team_id, criterion_id, judge_id)`
- Index on `(event_id, judge_id)` — used by the summary query
- `down`: drop table

**File:** `server/src/migrations/20260326000005-create-team-comments.js`
- Create `team_comments` table
- Columns: `id` (UUID PK), `event_id` (UUID, FK→events CASCADE), `team_id` (UUID, FK→teams CASCADE), `judge_id` (UUID, FK→users CASCADE), `comment` (TEXT, NOT NULL), `created_at`, `updated_at`
- Unique constraint: `(team_id, judge_id)`
- `down`: drop table

---

### 2. Sequelize Models (2 new files)

**File:** `server/src/models/Score.js`
- `id`, `event_id`, `team_id`, `criterion_id`, `judge_id`, `value`
- Associations: `belongsTo Event`, `belongsTo Team`, `belongsTo Criterion`, `belongsTo User` (as `judge`)

**File:** `server/src/models/TeamComment.js`
- `id`, `event_id`, `team_id`, `judge_id`, `comment`
- Associations: `belongsTo Event`, `belongsTo Team`, `belongsTo User` (as `judge`)

**Update:** `server/src/models/index.js` — add associations for both new models.

---

### 3. Open Criteria Endpoint to Judges

**File:** `server/src/routes/criteriaRoutes.js`
- Change `GET /` from `requireAdmin` to `requireAuth` (both admin and judge can fetch criteria)
- All write routes (POST, PUT, DELETE) remain admin-only

---

### 4. Backend — Score Service

**File:** `server/src/services/scoreService.js`

**`upsertScores(eventId, teamId, judgeId, scores, comment)`**
- Validate judge is in `event_judges` for this event
- Validate all `criterionId`s belong to `eventId` and all criteria are covered
- Validate all values are integers 1–5
- Within a transaction:
  - Upsert each Score record (bulkCreate with updateOnDuplicate)
  - If `comment` is a non-empty string → upsert TeamComment
  - If `comment` is null/empty and a TeamComment exists → delete it
- Return `{ scores, comment }`

**`getScores(eventId, teamId, judgeId)`**
- Fetch all Score records for (eventId, teamId, judgeId)
- Fetch TeamComment for (teamId, judgeId)
- Return `{ scores: [...], comment: string | null }`

**`getScoresSummary(eventId, judgeId)`**
- Single query: find distinct teamIds in `scores` where (event_id, judge_id) matches
- Returns `{ [teamId]: true }` for all scored teams

---

### 5. Backend — Score Controller

**File:** `server/src/controllers/scoreController.js`

Three thin handlers delegating to scoreService:
- `putScores` → `scoreService.upsertScores(...)`
- `getScores` → `scoreService.getScores(...)`
- `getScoresSummary` → `scoreService.getScoresSummary(...)`

---

### 6. Backend — Validation Middleware

**File:** `server/src/middleware/validateScores.js`
- `scores` must be a non-empty array
- Each entry must have `criterionId` (string) and `value` (integer 1–5)
- `comment` if present must be a string ≤ 1000 chars
- Applied to the PUT route only

---

### 7. Backend — Score Routes

**File:** `server/src/routes/scoreRoutes.js`
```
GET  /api/events/:eventId/teams/scores-summary  → requireAuth (judge) → getScoresSummary
GET  /api/events/:eventId/teams/:teamId/scores  → requireAuth (judge) → getScores
PUT  /api/events/:eventId/teams/:teamId/scores  → requireAuth (judge) → validateScores → putScores
```

**Update:** `server/src/app.js` — mount `scoreRoutes` at `/api/events`.

---

### 8. Frontend — Score Service

**File:** `client/src/services/scoreService.js`
```js
getScores(eventId, teamId)      // GET scores for current judge + team
putScores(eventId, teamId, { scores, comment })  // PUT upsert
getScoresSummary(eventId)       // GET summary map { [teamId]: boolean }
```

---

### 9. Frontend — ScoringModal Component

**File:** `client/src/components/ScoringModal.jsx`

Props: `team`, `criteria`, `eventId`, `onClose`, `onSuccess`

Internal state:
- `selections`: `{ [criterionId]: number | null }` — initialized from fetched scores if editing
- `comment`: string
- `isLoading` (fetch on open), `isSubmitting`, `error`

On mount: fetch existing scores via `scoreService.getScores(eventId, team.id)` and pre-populate `selections` and `comment`.

**Structure:**
```
<dialog> / modal overlay
  Header: team name + close button (X)
  Body:
    <fieldset> per criterion (in sort_order):
      <legend>: criterion name (semibold) + description (secondary)
      Score selector: 5 buttons labeled 1–5, button group pattern
        - unselected: outlined (border-border-card, text-text-secondary)
        - selected: bg-accent text-white
        - min-h-[44px] for touch targets
    Comment textarea:
      label, textarea (bg-bg-input, border-border-input), char counter when >800
  Footer:
    Cancel button (secondary)
    Submit/Update button (primary)
      - disabled until all criteria have a selection
      - loading state: spinner + disabled + aria-busy
  Error: inline above footer, text-red-500
```

---

### 10. Frontend — Criteria Fetch in TeamSection (judge view)

**File:** `client/src/components/TeamSection.jsx`

Add props:
- `isJudge: boolean`
- Pass `eventId` already present

When `isJudge=true`:
- On mount, fetch criteria via `criteriaService.getCriteria(eventId)` (reuse existing or new service function)
- On mount, fetch scores summary via `scoreService.getScoresSummary(eventId)`
- Track `scoredTeamIds: Set<string>` and `criteria: []` in state
- When a score is successfully submitted: add teamId to `scoredTeamIds` (optimistic update)
- Pass `criteria`, `isJudge`, `hasScored` (boolean), `onScoringSuccess` down to TeamCard

---

### 11. Frontend — TeamCard Updates

**File:** `client/src/components/TeamCard.jsx`

Add props: `isJudge`, `hasScored`, `onScore`, `criteria`, `eventId`

Judge-view additions (when `isJudge=true`):
- "Score Team" or "Edit Scores" button (primary / secondary variant)
- "Scored" badge (green-600 text, accent-subtle bg, `text-xs font-medium`) when `hasScored=true`
- Clicking the button: open `ScoringModal` inline (local `showModal` state in TeamCard, or lifted to TeamSection — see below)

**Tradeoff — modal ownership:**
- **Option A (TeamCard owns modal):** Simpler, no prop drilling. Each card manages its own modal state.
- **Option B (TeamSection owns modal):** Only one modal in the DOM at a time, cleaner for accessibility (focus trap at one level).

**Recommendation:** Option B — TeamSection owns `scoringTeam` state, passes `onScore` callback to TeamCard. Renders `<ScoringModal>` once at the TeamSection level. Mirrors the existing `editingTeamId` / `deletingTeam` pattern already in TeamSection.

---

### 12. Frontend — EventDetailPage Updates

**File:** `client/src/pages/EventDetailPage.jsx`

- Derive `isJudge = user?.role === 'judge'`
- Pass `isJudge` to `<TeamSection>` (alongside existing props)
- No other changes needed

---

## File Change Summary

| File | Action |
|------|--------|
| `server/src/migrations/20260326000004-create-scores.js` | Create |
| `server/src/migrations/20260326000005-create-team-comments.js` | Create |
| `server/src/models/Score.js` | Create |
| `server/src/models/TeamComment.js` | Create |
| `server/src/models/index.js` | Update (add associations) |
| `server/src/services/scoreService.js` | Create |
| `server/src/controllers/scoreController.js` | Create |
| `server/src/middleware/validateScores.js` | Create |
| `server/src/routes/scoreRoutes.js` | Create |
| `server/src/routes/criteriaRoutes.js` | Update (open GET to judges) |
| `server/src/app.js` | Update (mount scoreRoutes) |
| `client/src/services/scoreService.js` | Create |
| `client/src/components/ScoringModal.jsx` | Create |
| `client/src/components/TeamSection.jsx` | Update |
| `client/src/components/TeamCard.jsx` | Update |
| `client/src/pages/EventDetailPage.jsx` | Update |

---

## Open Questions for Review

1. **Summary endpoint** — confirmed approach to avoid N+1? (Step 4 / Step 7)
2. **Criteria visibility** — open `GET /criteria` to judges? (Step 3)
3. **Modal ownership** — TeamSection owns modal state (Option B)? (Step 11)
