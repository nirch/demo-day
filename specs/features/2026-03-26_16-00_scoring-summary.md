## Feature: Scoring Summary

### Problem Statement

After judges submit their scores, the admin has no way to see an aggregated view of results. They need a single page that ranks teams by overall performance, shows average scores, and lets them drill into the full breakdown per judge and criterion — including identifying judges who haven't finished scoring.

### User Stories

- As an **admin**, I want to see all teams ranked by their average score so that I can quickly understand the overall standings.
- As an **admin**, I want to click on a team to see every score per criterion per judge, plus judge comments, so that I can understand how the final average was reached.
- As an **admin**, I want to see which teams have incomplete scoring (not all judges have scored) so that I can follow up before finalizing results.
- As an **admin**, I want to see which specific judges have missing scores for a team so that I can identify who still needs to submit.

### Acceptance Criteria

- [ ] Event details page shows a "Scoring Summary" link/button visible only to admins
- [ ] Clicking the link navigates to `/events/:eventId/scoring-summary`
- [ ] The summary page displays all teams ordered by average score (highest first)
- [ ] Each team row shows: team name, average score (mean of all individual score values across all judges and all criteria), and a visual indicator if scoring is incomplete
- [ ] Average scores are rounded to one decimal place
- [ ] Teams with no scores yet appear at the bottom with a "No scores" indicator
- [ ] Clicking a team row expands/reveals a detailed breakdown section
- [ ] The breakdown shows a matrix: rows = criteria (sorted by `sort_order`), columns = judges
- [ ] Each cell in the matrix shows the score value (1-5), or a clear "missing" indicator if that judge hasn't scored that criterion
- [ ] Below the score matrix, each judge's comment for the team is displayed (if any)
- [ ] Judges with completely missing scores for a team are visually distinguishable (e.g., their column is highlighted or flagged)
- [ ] The page is accessible only to admin users; judges and unauthenticated users are redirected

### UI/UX Notes

#### Key Screens / States

**Summary List View:**
- Page header: event name + "Scoring Summary" title
- Back link to event details page
- Ranked list of teams, each row showing:
  - Rank number
  - Team name
  - Average score (e.g., "3.8 / 5")
  - Completion badge: "Complete" (all judges scored all criteria) or "Incomplete (2/3 judges)" style indicator
- Rows are clickable/expandable

**Team Breakdown (expanded):**
- Score matrix table:
  - Column headers: judge names
  - Row headers: criterion names (sorted by `sort_order`)
  - Cells: score value (1-5) or "—" for missing
  - Column-level indicator if a judge has no scores at all for this team
- Comments section below the matrix:
  - Each judge's comment displayed with the judge's name as a label
  - If a judge left no comment, omit them from this section (don't show an empty slot)

#### Empty State
- If no scores have been submitted for the entire event: show a message like "No scores have been submitted yet." with context that judges need to complete scoring first.

#### Loading State
- Skeleton loader while fetching scoring data

#### Error State
- Inline error message with retry option if the API call fails

#### Responsive Behavior
- On mobile, the score matrix should scroll horizontally if there are many judges
- Team rows remain full-width and tappable

### API

**Endpoint:** `GET /api/events/:eventId/scoring-summary`
**Auth:** Admin only
**Response shape:**
```json
{
  "data": {
    "event": {
      "id": "uuid",
      "name": "Demo Day 2026"
    },
    "criteria": [
      { "id": "uuid", "name": "Technical Complexity", "sortOrder": 0 }
    ],
    "judges": [
      { "id": "uuid", "name": "Judge Name" }
    ],
    "teams": [
      {
        "id": "uuid",
        "name": "Team Alpha",
        "averageScore": 3.8,
        "totalScores": 10,
        "expectedScores": 15,
        "isComplete": false,
        "scores": [
          {
            "criterionId": "uuid",
            "judgeId": "uuid",
            "value": 4
          }
        ],
        "comments": [
          {
            "judgeId": "uuid",
            "comment": "Great presentation!"
          }
        ]
      }
    ]
  },
  "error": null
}
```

- `totalScores`: number of scores submitted for this team
- `expectedScores`: `number of judges * number of criteria` (what a fully-scored team would have)
- `teams` array is sorted by `averageScore` descending; teams with no scores last

### Out of Scope

- Event status gating (summary accessible regardless of event status for now)
- Viewer / judge access to this page
- Exporting or printing the summary
- Editing scores from this page
- Winner selection / announcement from this page
- Real-time updates (live score refresh)

### Open Questions

None — all questions resolved prior to spec.
