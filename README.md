# Building a Full-Stack App with Claude Code

> A lesson guide for Full-Stack Bootcamp students on how to work effectively with Claude Code
> as a development partner — from project setup to feature delivery.

---

## Table of Contents

- [Introduction](#introduction)
- [Learning Objectives](#learning-objectives)
- [CLAUDE.md — The Project Constitution](#claudemd--the-project-constitution)
- [Skills (Custom Commands)](#skills-custom-commands)
- [Product, Dev, and QA Roles](#product-dev-and-qa-roles)
- [Step 1: Initial Project Commit](#step-1-initial-project-commit)
- [Step 2: Adding Use Cases and Updating CLAUDE.md](#step-2-adding-use-cases-and-updating-claudemd)
- [Step 3: Design Direction](#step-3-design-direction)
- [The Product and Dev Cycle](#the-product-and-dev-cycle)
- [Step 4: Scaffolding the Project with the First Feature](#step-4-scaffolding-the-project-with-the-first-feature)
- [Step 5: Next Feature — Team Management](#step-5-next-feature--team-management)
- [Summary](#summary)

---

## Introduction

This guide walks you through the process of building a real full-stack application — **Demo Day**, a judging platform for bootcamp demo days — using **Claude Code** as your AI development partner.

The key insight: Claude Code is not just an autocomplete tool. When set up correctly, it becomes a **structured collaborator** that understands your project's rules, conventions, and design decisions. The difference between "using AI to code" and "building with AI" comes down to how well you set up the context.

This guide follows the actual development timeline of the Demo Day app, showing the exact steps, prompts, and decisions made along the way.

---

## Learning Objectives

By the end of this lesson, you will be able to:

1. **Write a `CLAUDE.md` file** that defines your project's stack, structure, conventions, and boundaries
2. **Create custom skills** (slash commands) that switch Claude into specialized roles (Product, Dev, QA)
3. **Establish a design system** from scratch — from direction brief to design tokens to component patterns
4. **Follow a structured product-to-dev cycle** — spec first, plan second, code third
5. **Scaffold a full-stack project** with a single feature as the foundation
6. **Iterate on features** using the established workflow and conventions
7. **Understand how context shapes AI output** — and why setup time pays for itself many times over

---

## CLAUDE.md — The Project Constitution

The `CLAUDE.md` file is the most important file in your project when working with Claude Code. It is **always loaded** at the start of every conversation, acting as the project's constitution — the set of rules, conventions, and constraints that Claude must follow.

### What belongs in CLAUDE.md

| Section | Purpose |
|---|---|
| **Project Overview** | What the app does, who it's for, what stage it's at |
| **Stack** | Every technology in use — framework, ORM, DB, auth, testing, deployment |
| **Project Structure** | Directory layout so Claude knows where things go |
| **Naming Conventions** | Files, DB tables, models, routes, env vars, components |
| **Environment Variables** | What exists, what's required, what's gitignored |
| **Database Rules** | Migrations as source of truth, transaction requirements |
| **API Design Rules** | Route prefixes, response envelopes, validation approach |
| **Error Handling** | How errors flow from catch to response |
| **Non-Negotiables** | The rules that are never broken, no exceptions |

### Best Practices

- **Be specific, not vague.** "Use Sequelize" is less useful than "Use Sequelize with explicit `attributes` arrays — no `SELECT *`."
- **Include examples.** Show the response envelope format. Show the naming pattern. Claude follows examples better than descriptions.
- **Define what NOT to do.** Non-negotiables prevent the most common mistakes: no `console.log`, no hardcoded values, no inline styles.
- **Keep it current.** Update CLAUDE.md as your project evolves. A stale constitution is worse than none — it creates contradictions.
- **Don't overload it.** Role-specific instructions go in skills/commands, not in CLAUDE.md. Keep the constitution focused on project-wide rules.

### See the full file

[View this project's CLAUDE.md](./CLAUDE.md)

---

## Skills (Custom Commands)

Skills (also called custom commands) are markdown files in `.claude/commands/` that you invoke with a slash command (e.g., `/product`, `/dev`, `/qa`). They act as **role switches** — loading a set of instructions that change how Claude thinks and operates for the rest of the session.

### Why use skills?

Without skills, you'd need to repeat instructions every time you start a new conversation:

> "You are a product designer. Write specs in this format. Include acceptance criteria. Don't forget edge cases..."

With skills, you just type `/product` and all of that context is loaded automatically.

### How they work

```
.claude/commands/
├── product.md    →  /product   (Product + UI/UX mode)
├── dev.md        →  /dev       (Senior developer mode)
├── qa.md         →  /qa        (QA engineer mode)
└── design.md     →  /design    (Design system reference)
```

Each file defines:
1. **The role** Claude should play ("You are a senior full-stack developer")
2. **The process** to follow (e.g., "Read the spec before writing code")
3. **The patterns** to use (code examples, templates, checklists)
4. **The guardrails** ("Flag tradeoffs, don't silently choose")

### Best Practices

- **One role per file.** Don't combine product and dev instructions — they serve different purposes.
- **Include templates.** Show Claude the exact format you want (spec template, test structure, etc.).
- **Add checklists.** These catch things Claude might skip (migration `down`, error states, auth checks).
- **Define when to push back.** Tell Claude when to ask questions instead of guessing.

---

## Product, Dev, and QA Roles

### `/product` — Product + UI/UX Mode

Turns Claude into a **senior product designer**. Use this when defining what to build.

**Key behaviors:**
- Asks clarifying questions before proposing solutions
- Writes structured feature specs (problem statement, user stories, acceptance criteria)
- Thinks in user flows and edge cases, not just happy paths
- Defines all UI states (empty, loading, error, success)
- Saves specs to `specs/features/` with timestamped filenames

[View product.md](./.claude/commands/product.md)

### `/dev` — Senior Full-Stack Developer Mode

Turns Claude into a **senior full-stack developer**. Use this when implementing features.

**Key behaviors:**
- Enters planning mode before writing any code
- Reads the spec file first, writes an implementation plan, waits for approval
- Loads the design system before writing any UI component
- Follows backend patterns (thin controllers, services for business logic, middleware for validation)
- Flags tradeoffs instead of silently choosing

[View dev.md](./.claude/commands/dev.md)

### `/qa` — QA Engineer Mode

Turns Claude into a **senior QA engineer**. Use this when writing tests.

**Key behaviors:**
- Thinks adversarially — finds what breaks, not confirms what works
- Defines test strategy before writing any tests
- Covers three test layers: unit (Jest), integration (Supertest), E2E (Playwright)
- Writes regression tests for every bug fix
- Flags bad test patterns (implementation-detail assertions, over-mocking, happy-path-only)

[View qa.md](./.claude/commands/qa.md)

---

## Step 1: Initial Project Commit

The first commit establishes the foundation — before any application code exists.

```
Initial commit contents:
├── CLAUDE.md                       # Project constitution (stack-agnostic at first)
├── .claude/commands/product.md     # Product role
├── .claude/commands/dev.md         # Developer role
└── .claude/commands/qa.md          # QA role
```

**Why commit these first?**

- Every future conversation starts with context. Claude knows the rules from commit #1.
- The roles are ready before any feature work begins.
- The team (or future-you) can see exactly what instructions Claude is operating under.

> **Git history reference:**
> `dde9b43 initial commit with claude md files. no project definition yet..`
> `19a6a45 switching the roles (product, dev, qa) to commands`

At this point, CLAUDE.md contains the stack and conventions but no project-specific details (no app name, no users, no use cases). That comes next.

---

## Step 2: Adding Use Cases and Updating CLAUDE.md

Once the foundation is in place, define **what the app actually does** by writing initial use cases.

### The use cases file

Create `specs/initial-use-cases.md` with the high-level user roles and what each can do:

```markdown
## Target Users
- Admin
- Judge
- Viewer

## Use Cases (Per User)

### Viewer
- Accepts an invite to a demo-day event (given a URL)
- Views a summary of the teams and demos
- View demo day results

### Judge
Has all Viewer use cases plus:
- When accepts an invite needs to provide the judge details
- Per demo (team) provides scores on different criterias
- View a summary of all scores per team
- Decide on a winner

### Admin
Has all Judge use cases plus:
- Create a demo day event with event information
- Send invites to viewers and judges
- Remove a judge
- Decide on a winner per demo day
```

[View the full use cases file](./specs/initial-use-cases.md)

### Updating CLAUDE.md with project context

After writing the use cases, ask Claude to update CLAUDE.md to reflect the project:

```
I've added specs/initial-use-cases.md with the app's use cases.
Read it and update CLAUDE.md to reflect the project — add the app name,
purpose, stage, and target users. Keep the existing structure and
conventions, just fill in the project-specific details.
```

> **Git history reference:**
> `2e746e5 update CLAUDE.md with project details and add initial use cases documentation`

Now every future conversation knows: this is "Demo Day", an MVP judging platform with three user roles.

---

## Step 3: Design Direction

Before writing any UI code, establish a visual direction. This is a multi-step process that results in a complete design system — from abstract tone to concrete CSS tokens.

### 3.1 Design Direction Brief

Start a product session and define the visual direction for the app. The brief captures tone, constraints, and reference points — not specific colors or sizes yet.

```
/product

I want to define the visual design direction for Demo Day before
we start building any UI. Let's create a design direction brief.

Here's what I know:
- It's used during a live bootcamp demo day event
- Judges use their personal devices to score in real time
- Results may be projected on a big screen
- The audience is industry professionals and bootcamp students
- It should feel warm and celebratory but not flashy or childish
- It should NOT look like a generic SaaS dashboard or a Google Form

Let's define: tone adjectives, what to avoid, reference points,
and constraints. Save the result to specs/design/direction-brief.md.
```

This produces a brief that defines the *feel* before any visual decisions are made.

[View direction-brief.md](./specs/design/direction-brief.md)

> **Git history reference:**
> `c34da87 add design direction brief document outlining visual guidelines and constraints`

### 3.2 Design Options

With the brief as context, generate visual options to choose from. These are rendered as HTML files that you can open in a browser to evaluate.

```
Based on the direction brief, generate 3 distinct visual options
as HTML files. Each option should show a sample scoring card with:
- Team name, description, criteria labels, score inputs, and a submit button
- Use a different color palette for each
- Include typography, spacing, borders, and radius
Save them to specs/design/options.html
```

[View options.html](./specs/design/options.html) — open this in a browser to see the visual options.

After reviewing the options, select one direction (in this case, "Option B — Soft Modern" was chosen) and approve the palette.

### 3.3 Design Tokens

Once a palette is approved, convert it into CSS custom properties — the single source of truth for all design values in the app.

[View tokens.css](./client/src/styles/tokens.css)

```css
:root {
  /* Backgrounds */
  --color-bg-page:    #f8fafc;
  --color-bg-surface: #ffffff;
  --color-bg-input:   #f8fafc;

  /* Text */
  --color-text-primary:   #0f172a;
  --color-text-secondary: #64748b;
  --color-text-muted:     #94a3b8;

  /* Accent */
  --color-accent:        #6366f1;
  --color-accent-subtle: #ede9fe;

  /* ... spacing, radius, shadows, typography ... */
}
```

These tokens flow into `tailwind.config.js`, which maps them to utility classes used in components. No raw hex values or pixel sizes are ever used in JSX.

### 3.4 Visual Preview

Preview files let you see how the palette and components look together before writing any React code.

- [View palette.html](./specs/design/palette.html) — color swatches and typography scale
- [View preview.html](./specs/design/preview.html) — sample components using the approved tokens

### 3.5 Design Role (design.md)

Finally, create a design system reference skill that Claude loads before writing any UI:

```
.claude/commands/design.md  →  /design
```

This file defines the exact Tailwind classes for every component pattern (buttons, forms, cards, typography), spacing rules, color usage rules, and accessibility requirements.

The `/dev` role was also updated to include: *"Before writing any UI component, load `/design` to read the design system reference."*

[View design.md](./.claude/commands/design.md)

> **Git history reference:**
> `fd9aebd Add design options, approved palette, and token preview HTML files`
> `62e1309 Add design system reference and update styling guidelines in project documentation`

---

## The Product and Dev Cycle

With the foundation in place, every feature follows the same cycle:

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   /product  →  Feature Spec  →  /dev  →  Plan  →  Code  │
│                                                          │
│   1. Define     2. Write spec    3. Switch   4. Plan    5. Implement  │
│      the           with all         to dev      before     after      │
│      problem       states           mode        coding     approval   │
│                                                                      │
└──────────────────────────────────────────────────────────┘
```

### The Product Phase (`/product`)

1. Start a session with `/product`
2. Describe the feature you want to build
3. Claude asks clarifying questions, identifies edge cases
4. Claude writes a structured spec: problem statement, user stories, acceptance criteria, UI/UX notes, data model, API endpoints, out of scope
5. Spec is saved to `specs/features/YYYY-MM-DD_HH-MM_feature-name.md`

### The Dev Phase (`/dev`)

1. Start a new session with `/dev`
2. Claude asks which spec to read from `specs/features/`
3. Claude reads the spec and writes an implementation plan
4. Plan is saved to `specs/features/YYYY-MM-DD_HH-MM_feature-name-plan.md`
5. You review, comment, and approve the plan
6. Only then does Claude start writing code

### Why this matters

- **Specs prevent scope creep.** The "out of scope" section is as important as the features section.
- **Plans prevent surprises.** You see the architecture before any code is written.
- **Approval gates prevent waste.** Claude doesn't write 500 lines of code in the wrong direction.
- **Everything is documented.** Future sessions can reference past specs and plans.

---

## Step 4: Scaffolding the Project with the First Feature

The first feature — **Event Creation** — also serves as the project scaffold. It establishes the full-stack structure: auth, database, API layer, and frontend routing.

### The prompt

```
/product

I want to build the first feature: Event Creation.
This is also the project scaffold — it should establish the full-stack
structure (auth, DB, API, frontend routing).

The admin should be able to:
- Log in with email and password (no signup — admins are seeded)
- Create an event with name, date, description, and time limit per demo
- See a list of all events
- View event details

Events start in "draft" status by default.
```

This produces a detailed feature spec with data models, API endpoints, validation rules, and UI states for every screen.

[View the event creation spec](./specs/features/2026-03-23-1626-event-creation-scaffold.md)

### Implementation

After the spec is approved, switch to dev mode:

```
/dev

Read the event creation scaffold spec and write an implementation plan.
```

Claude reads the spec, creates a step-by-step plan (migrations, models, routes, middleware, controllers, services, frontend components), and waits for approval before writing any code.

> **Git history reference:**
> `1bc7f47 Add event creation feature and project scaffold documentation`
> `6f45061 Feature Implemented: Event Creation + Project Scaffold`

---

## Step 5: Next Feature — Team Management

With the scaffold in place, the second feature follows the established cycle exactly.

### Product phase

```
/product

Next feature: Team Management.
After creating an event, the admin needs to add teams that will present.
Teams have a name, members, optional presentation URL, and optional live app URL.
Teams can only be modified while the event is in draft status.
```

Claude produces a spec with:
- Data model for `teams` table (with composite unique constraint on `event_id` + `name`)
- CRUD API endpoints nested under `/api/events/:eventId/teams`
- Status lock logic (403 if event is not in `draft`)
- UI: inline expandable forms, team cards, delete confirmation dialogs
- All states: empty, loading, error (fetch), error (save), delete confirmation

[View the team management spec](./specs/features/2026-03-24_11-59_team-management.md)

### Dev phase

```
/dev

Read the team management spec and write an implementation plan.
```

> **Git history reference:**
> `98c7c95 Feature Definition: Team Management`
> `45e8c2e Feature Implementation: Team Management`

Each subsequent feature (scoring criteria, judge invites, team scoring, scoring summary) followed this same cycle — getting progressively faster as conventions and patterns were already established.

---

## Summary

### What we built

A full-stack judging platform — from zero to a working MVP — using Claude Code as a structured development partner.

### What made it work

| Practice | Why it matters |
|---|---|
| **CLAUDE.md first** | Every conversation starts with the right context — stack, conventions, non-negotiables |
| **Role-based skills** | `/product`, `/dev`, `/qa` switch Claude's mindset to match the task at hand |
| **Design system before code** | Direction brief → tokens → component patterns. No guessing, no inconsistency |
| **Spec → Plan → Code** | Never write code without a spec. Never write code without a plan. Approval gates prevent waste |
| **Everything documented** | Specs, plans, and design decisions live in the repo. Future conversations can reference them |

### The key takeaway

The quality of AI-assisted development is directly proportional to the quality of the context you provide. Time spent on `CLAUDE.md`, skills, and specs is not overhead — it's the foundation that makes everything else faster, more consistent, and more maintainable.

**Set up the rules. Define the roles. Spec before you build. The AI follows your lead.**
