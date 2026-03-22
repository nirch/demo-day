# Design System Reference

> Load this at the start of any session that involves writing or modifying UI components.
> This is the single source of truth for how components should look and behave.
> For visual token values, see `client/src/styles/tokens.css`.
> For the full design rationale, see `specs/design/direction-brief.md`.

---

## 1. How to Use This

**Never hardcode a design value.** No raw hex colors, pixel sizes, or magic numbers in JSX or CSS.

```jsx
// WRONG
<div style={{ color: '#0f172a', fontSize: '13px', borderRadius: '12px' }}>

// RIGHT
<div className="text-text-primary text-base rounded-md">
```

- All values flow from `tokens.css` → `tailwind.config.js` → component className
- Use Tailwind utility classes (mapped to tokens) as the default approach
- Only reach for `style={{}}` or raw CSS when Tailwind's utility model can't express it (e.g. dynamic values from JS)
- When a new token is needed, add it to `tokens.css` first, then extend `tailwind.config.js` — never invent a one-off value inline
- `tokens.css` must be imported in `main.jsx` before anything else

---

## 2. Button Patterns

### Variants

**Primary** — the main action on a screen. Use once per view.
```jsx
<button className="
  bg-accent text-white
  text-md font-medium tracking-tight
  px-6 py-[11px] rounded-sm
  transition-colors duration-base
  hover:opacity-90
  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
  disabled:opacity-40 disabled:cursor-not-allowed
">
  Submit Scores
</button>
```

**Secondary** — lower-emphasis action, alongside a primary.
```jsx
<button className="
  bg-transparent text-text-primary
  text-md font-medium
  px-6 py-[11px] rounded-sm
  border border-border-card
  transition-colors duration-base
  hover:bg-bg-page
  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
  disabled:opacity-40 disabled:cursor-not-allowed
">
  Cancel
</button>
```

**Danger** — destructive actions (remove judge, delete event). Always paired with a confirmation.
```jsx
<button className="
  bg-transparent text-red-600
  text-md font-medium
  px-6 py-[11px] rounded-sm
  border border-red-200
  transition-colors duration-base
  hover:bg-red-50
  focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2
  disabled:opacity-40 disabled:cursor-not-allowed
">
  Remove Judge
</button>
```

### Button Rules
- Minimum touch target: 44×44px — use padding to achieve this on small buttons
- Never remove the focus ring — only replace it with a custom one
- `disabled` must use the `disabled` HTML attribute, not just visual styling
- Loading state: replace label text with a spinner, keep the button size stable, add `disabled` and `aria-busy="true"`

---

## 3. Form Patterns

### Input
```jsx
<div className="flex flex-col gap-[6px]">
  <label className="text-xs font-semibold uppercase tracking-[0.06em] text-text-muted">
    Innovation
  </label>
  <input
    type="number"
    className="
      bg-bg-input text-text-primary text-lg font-medium
      px-3 py-2 rounded-sm
      border-[1.5px] border-border-input
      transition-colors duration-fast
      focus:outline-none focus:border-accent focus:bg-bg-surface
      placeholder:text-text-muted
    "
    placeholder="1–10"
  />
</div>
```

### Validation States

**Error state** — applied when validation fails:
```jsx
<input className="... border-red-400 focus:border-red-500" aria-invalid="true" aria-describedby="field-error" />
<p id="field-error" className="text-xs text-red-500 mt-1">Score must be between 1 and 10.</p>
```

**Success state** — use sparingly, only when confirmation adds real value:
```jsx
<input className="... border-green-400" aria-describedby="field-success" />
<p id="field-success" className="text-xs text-green-600 mt-1">Saved.</p>
```

### Form Rules
- Labels are always visible — never placeholder-only labels
- Validate inline on blur, not only on submit
- Error messages must be specific: "Score must be between 1 and 10" not "Invalid input"
- Error messages are linked to their input via `aria-describedby`
- Group related fields in a `<fieldset>` with a `<legend>`

---

## 4. Card Patterns

### Standard Card
```jsx
<div className="bg-bg-surface border border-border-card rounded-md p-5 shadow-sm">
  {/* content */}
</div>
```

### Card Rules
- Background: always `bg-bg-surface` (`#ffffff`) — cards sit on `bg-bg-page`
- Border: always `border-border-card` — never omit, never use shadow as a substitute for border
- Radius: `rounded-md` (12px) for cards, `rounded-lg` (16px) for outer page containers only
- Shadow: `shadow-sm` default; `shadow-md` for modals or elevated overlays; `shadow-lg` for dropdowns
- Internal padding: `p-5` (20px) vertical, `px-6` (24px) horizontal — or use `px-6 py-5` explicitly
- Gap between stacked cards: `gap-3` (12px)
- Never nest cards more than one level deep

---

## 5. Typography Patterns

| Use case | Tailwind classes |
|---|---|
| Page / section heading | `text-3xl font-semibold tracking-tight` |
| Subheading / team name | `text-xl font-semibold tracking-tight` |
| Wordmark / nav title | `text-2xl font-semibold` |
| Body text | `text-base text-text-secondary` |
| Supporting / description | `text-base text-text-secondary` |
| Criteria / field label | `text-xs font-semibold uppercase tracking-[0.06em] text-text-muted` |
| Button label | `text-md font-medium tracking-tight` |
| Tag / badge | `text-xs font-medium` |
| Event meta (nav) | `text-sm font-medium text-text-secondary` |

### Typography Rules
- Font family is set globally via `font-sans` on `<body>` — don't set it per-component
- Heading hierarchy: one `<h1>` per page, use `<h2>`–`<h4>` for sub-sections — semantic HTML matters
- Never use `font-bold` (700) — the heaviest weight in this system is `font-semibold` (600)
- Negative tracking (`tracking-tight`) only on headings — never on body text or labels

---

## 6. Spacing Rules

### Internal padding (inside a component)
| Component | Value |
|---|---|
| Page body | `px-8 py-9` (32px / 36px) |
| Nav bar | `px-8 py-5` (32px / 20px) |
| Card | `px-6 py-5` (24px / 20px) |
| Input | `px-3 py-2` (12px / 8px) |
| Button | `px-6 py-[11px]` |

### Between-element spacing (gap / margin)
| Context | Value |
|---|---|
| Cards in a list | `gap-3` (12px) |
| Label → input | `gap-[6px]` |
| Section subtext → first card | `mb-7` (28px) |
| Team description → criteria row | `mb-4` (16px) |
| Button below a form section | `mt-6` (24px) |
| Columns within a criteria row | `gap-3` (12px) |

### Spacing Rules
- Use `gap` on flex/grid parents rather than `margin` on children
- Page-level vertical rhythm: sections are separated by `mb-16` (64px)
- Never use arbitrary pixel values outside of this table — add a new token if needed

---

## 7. Color Usage Rules

| Token | When to use |
|---|---|
| `bg-bg-page` | The root page background — outermost layer only |
| `bg-bg-surface` | Cards, nav, modals — any elevated surface |
| `bg-bg-input` | Input fields and textareas only |
| `text-text-primary` | Headings, team names, any primary content |
| `text-text-secondary` | Body copy, descriptions, supporting text |
| `text-text-muted` | Labels, metadata, placeholders, empty states |
| `accent` / `bg-accent` | Primary buttons, active states, focus rings, links |
| `accent-subtle` / `bg-accent-subtle` | Tags, badges, highlighted rows — never for large areas |
| `border-border-nav` | Horizontal nav dividers only |
| `border-border-card` | Card borders, input borders (default state) |

### Color Rules
- `accent` is the only interactive color — don't introduce ad-hoc blues, greens, or purples
- Red (`red-400` / `red-600`) is reserved exclusively for errors and danger actions
- Green (`green-500` / `green-600`) is reserved exclusively for success states
- Never use `text-text-muted` for interactive elements — it fails contrast requirements
- Background layering is always: `bg-page` → `bg-surface` — never surface on surface

---

## 8. Accessibility Non-Negotiables

### Focus
- Every interactive element must have a visible focus ring
- Use `focus:ring-2 focus:ring-accent focus:ring-offset-2` as the standard pattern
- Never use `outline-none` without a custom focus style immediately after it
- Focus order must follow visual reading order — avoid `tabindex` hacks

### Contrast
- `text-text-primary` on `bg-bg-surface`: passes WCAG AA (and AA Large)
- `text-text-secondary` on `bg-bg-surface`: passes WCAG AA
- `text-text-muted` on `bg-bg-surface`: use only for non-essential decorative text — do not use for interactive labels or error messages
- White text on `accent`: passes WCAG AA — safe for buttons

### Touch targets
- Minimum 44×44px for all interactive elements
- Score inputs: ensure the tap area is large enough for in-event use — use `min-h-[44px]`
- Buttons: padding is sized to meet this — don't reduce it

### ARIA
- Inputs must have associated `<label>` elements (via `htmlFor` / `id`, not just proximity)
- Error messages linked with `aria-describedby`
- Invalid fields marked with `aria-invalid="true"`
- Loading buttons: `aria-busy="true"` + `disabled`
- Icon-only buttons: `aria-label` required
- Live score updates: wrap in `aria-live="polite"` region

---

## 9. Tailwind + Tokens: How They Work Together

### The chain
```
tokens.css (:root variables)
    ↓
tailwind.config.js (maps variables to utility names)
    ↓
JSX className (uses utility names)
```

### What's available in Tailwind

| Category | Utility prefix | Example |
|---|---|---|
| Colors | `bg-`, `text-`, `border-` | `bg-accent`, `text-text-primary`, `border-border-card` |
| Border radius | `rounded-` | `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-pill` |
| Shadows | `shadow-` | `shadow-sm`, `shadow-md`, `shadow-lg` |
| Transition duration | `duration-` | `duration-fast`, `duration-base`, `duration-slow` |
| Font size | `text-` | `text-xs`, `text-base`, `text-3xl` |
| Font family | `font-` | `font-sans` (set on body) |

### When to use `style={{}}` instead of className
Only when the value is truly dynamic (e.g. a score percentage driving a progress bar width). Even then, reference a CSS variable:
```jsx
// Acceptable dynamic use
<div style={{ width: `${score * 10}%` }} />

// Still wrong even if dynamic
<div style={{ color: '#6366f1' }} />
```

### Arbitrary values
Tailwind's `[]` syntax is allowed only for values that are genuinely one-off layout needs (e.g. `py-[11px]` for button padding). If you use the same arbitrary value twice, it belongs in a token.
