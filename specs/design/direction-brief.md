# Design Direction Brief

> This document captures the agreed visual direction for Demo Day.
> Use it as a reference before making any design or styling decisions.

---

## Tone Adjectives

- Warm
- Human
- Considered
- Quietly celebratory
- Approachable
- Trustworthy
- Intentional

---

## What to Avoid

- Flashy or loud — this is a low-scale celebratory event, not a concert
- Cold or sparse — whitespace should feel intentional, not empty
- Generic or form-like — judges shouldn't feel like they're filling out a Google Form
- Enterprise / corporate — professional but never stiff
- Childish or over-designed — no confetti, no gimmicks

---

## Reference Points

- **Closest feel:** Clean educational platforms (e.g. Teachable, Coursera) — calm, structured, human
- **Event quality:** Graduation-day energy — pride, achievement, a sense of occasion
- **Not:** SaaS dashboards, sports scoreboards, or Bootstrap defaults
- **Standalone identity** — not tied to any existing brand

---

## Constraints

- **Personal device first:** All screens are used on judges' and viewers' own devices during a live event
- **Projection scale:** The results page must also hold up on a big screen — readable from a distance, visually substantial
- **Live event pressure:** Judges score in real time between demos — UI must allow fast, confident interaction without cognitive load
- **Mixed audience:** Industry professionals and bootcamp students share the same product — it must feel credible to both

---

## Approved Palette

> Selected from Option B (Soft Modern). These are the canonical values for the MVP.

### Colors

| Role | Hex |
|---|---|
| Page background | `#f8fafc` |
| Surface (nav, card) | `#ffffff` |
| Input background | `#f8fafc` |
| Border (nav) | `#e8edf2` |
| Border (card, input) | `#e2e8f0` |
| Text — primary | `#0f172a` |
| Text — secondary | `#64748b` |
| Text — label / muted | `#94a3b8` |
| Accent | `#6366f1` |
| Accent (tag background) | `#ede9fe` |
| Accent (input focus border) | `#6366f1` |
| Button text | `#ffffff` |

### Typography

| Role | Family | Size | Weight | Other |
|---|---|---|---|---|
| Wordmark | DM Sans | 17px | 600 | — |
| Event name | DM Sans | 12px | 500 | — |
| Section heading | DM Sans | 22px | 600 | `letter-spacing: -0.02em` |
| Section subtext | DM Sans | 13px | 400 | — |
| Team name | DM Sans | 16px | 600 | `letter-spacing: -0.01em` |
| Team description | DM Sans | 13px | 400 | — |
| Criteria label | DM Sans | 11px | 600 | uppercase, `letter-spacing: 0.06em` |
| Score input | DM Sans | 15px | 500 | — |
| Button | DM Sans | 14px | 500 | `letter-spacing: -0.01em` |
| Tag | DM Sans | 11px | 500 | — |

### Spacing

| Role | Value |
|---|---|
| Nav padding | `20px 32px` |
| Body/page padding | `36px 32px` |
| Card padding | `20px 24px` |
| Card gap (between cards) | `12px` |
| Criteria column gap | `12px` |
| Section subtext → card | `28px` |
| Team desc → criteria | `16px` |
| Label → input | `6px` |
| Button top margin | `24px` |
| Input padding | `8px 12px` |
| Button padding | `11px 24px` |

### Border Radius

| Element | Value |
|---|---|
| Container (outer) | `16px` |
| Card | `12px` |
| Input | `8px` |
| Button | `8px` |
| Tag (pill) | `100px` |

### Borders

| Element | Value |
|---|---|
| Nav divider | `1px solid #e8edf2` |
| Card | `1px solid #e2e8f0` |
| Input (default) | `1.5px solid #e2e8f0` |
| Input (focus) | `1.5px solid #6366f1` |

---

## Deferred

- **Winner reveal screen:** Should eventually feel elevated as a designed moment (full-screen, projection-ready). Out of scope for MVP — address as a future design feature.
