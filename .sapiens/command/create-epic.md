# Command: /create-epic

Create a feature epic — break down a product need into a structured track with sequenced tickets.

**Brief or Source** (required): $ARGUMENTS

> Preferred: pass the `NEED-BRIEF.md` from `/value-analysis` for best results.
> Also accepts: free text, Figma URL, Notion URL, GitLab/GitHub issue URL.

## Examples

### Recommended Usage (after `/value-analysis`)

**When to use**: Value analysis is complete and validated

```
/create-epic .sapiens/tracks/pdf-export/NEED-BRIEF.md
```

**Result**: Reads the validated brief. Generates sequenced tickets with BDD acceptance criteria. Creates full track structure. Updates track status to `Value Analysis Ready` (auto-first flow). If `ticket_backend=notion`, creates tickets as Notion pages linked by `Track`. Takes ~5 minutes.

---

### Quick Usage (direct)

**When to use**: Simple feature or PM prefers to skip value analysis

```
/create-epic "Users should be able to export their dashboard as PDF"
```

**Result**: Analyzes the need directly. Creates `.sapiens/tracks/pdf-export/` with: README, sequenced tickets (BDD format), IMPLEMENTATION-GUIDE.md. Status: `Value Analysis Ready` (auto-first flow). Takes ~5 minutes.

---

### Advanced Usage

**When to use**: PM has a Figma design or an existing issue to spec from

```
/create-epic https://figma.com/file/abc123/Dashboard-Export
```

**Result**: Reads Figma design via MCP. Extracts UI flows, interactions, edge cases. Creates track with tickets aligned to design screens. Acceptance criteria in Given/When/Then format derived from Figma annotations.

---

## Workflow

### Phase 0: Read Backend Configuration

Read `.sapiens/tools` and extract:
- `ticket_backend` (default: `filesystem`) — where to create tickets: `filesystem` | `local` | `notion` | `gitlab` | `github`
- `ticket_backend_database` — Notion database ID (if `notion`)
- `ticket_backend_project` — GitLab project ID (if `gitlab`)

### Phase 1: Analyze the Need

1. Parse `$ARGUMENTS`:
   - If path to `NEED-BRIEF.md` → read it directly (output of `/value-analysis`)
   - If URL → fetch content via MCP (Figma, Notion, GitLab/GitHub issue)
   - If free text → analyze intent directly

2. If reading from `NEED-BRIEF.md`, extract:
   - Goal, target users, success criteria, constraints, out-of-scope — all already structured

3. Otherwise extract:
   - **Goal**: What problem does this solve for the user?
   - **Scope**: What is in / out of scope?
   - **Success criteria**: How do we know it's done?
   - **Complexity estimate**: Small (1-2 tickets) / Medium (3-5) / Large (6+)

4. Ask clarifying questions only if critical information is missing:
   - Who are the affected users?
   - Are there design references?
   - Are there dependencies on other features?
   - What is the target date or priority?

### Phase 2: Generate Track Name

Derive a short, kebab-case track name from the epic title:
- `"PDF export for dashboard"` → `pdf-export`
- `"OAuth2 login with Google"` → `oauth2-google`
- `"Notification system v2"` → `notification-system-v2`

Check that `.sapiens/tracks/{track-name}/` does not already exist.

### Phase 3: Decompose into Tickets

Break the epic into sequenced, independently implementable tickets:

**Decomposition principles**:
- Each ticket = 1 logical unit of work (4-13h)
- Tickets should be sequenced by dependency (backend before frontend, schema before API)
- Ticket 00 = reference architecture (no implementation, just context)
- Each ticket must have clear acceptance criteria in Given/When/Then format

**Typical decomposition patterns**:
- Data/schema change → API endpoint → Frontend integration → Tests/polish
- Backend service → Contract/types → Frontend consumer → E2E validation
- Core feature → Edge cases → Error handling → Documentation

### Phase 4: Create Track Structure

Create the following files:

**`.sapiens/tracks/{track-name}/README.md`**:
```markdown
# Epic: {Epic Title}

## Goal
{One sentence: what problem this solves and for whom}

## Scope

### In Scope
- {Feature 1}
- {Feature 2}

### Out of Scope
- {Explicitly excluded items}

## Success Criteria
- [ ] {Measurable outcome 1}
- [ ] {Measurable outcome 2}

## Complexity: {Small/Medium/Large} — {N} tickets

## Dependencies
- {Blocking epic or ticket, if any}

## Design References
- {Figma link or N/A}
```

**`.sapiens/tracks/{track-name}/tickets/00-reference.md`**:
```markdown
# Reference: {Epic Title} Architecture

## Context
{Why this epic exists, what it changes in the system}

## Technical Approach
{High-level implementation strategy}

## Key Files
{Existing files that will be modified}

## Patterns to Follow
{Existing patterns in the codebase to reuse}

## Risks & Unknowns
{Technical risks identified during analysis}
```

**`.sapiens/tracks/{track-name}/tickets/01-{first-ticket}.md`** (repeat for each ticket):
```markdown
# [Type] {Ticket Title}

## Motivation
{Why this ticket is needed in the context of the epic}

## Acceptance Criteria

- [ ] **Given** {precondition}, **When** {action}, **Then** {expected outcome}
- [ ] **Given** {precondition}, **When** {action}, **Then** {expected outcome}
- [ ] 🔍 **[Manual]** {cross-user or live-session criterion} — *verify by: {specific verification step}*

> **Note**: Prefix criteria with `🔍 [Manual]` when they cannot be verified from a code diff alone
> (e.g. cross-user visibility, real-time sync, UI rendering, E2E flows).
> `/validate-spec` will flag these as "Manual check required" rather than ❌ Not found.

## Technical Approach
{Implementation steps, files to create/modify, patterns to use}

## Testing Requirements
{Unit tests, integration tests, E2E scenarios}

## Estimated Complexity
{Small (<4h) / Medium (4-8h) / Large (>8h)}

## Dependencies
{Depends on: ticket 0X / none}
```

**`.sapiens/tracks/{track-name}/IMPLEMENTATION-GUIDE.md`**:
```markdown
# Implementation Guide: {Epic Title}

## Execution Order

1. [ ] `00-reference.md` — Read first, no implementation
2. [ ] `01-{ticket}` — {one-line description}
3. [ ] `02-{ticket}` — {one-line description}
...

## How to Execute Each Ticket

```
/implement-ticket .sapiens/tracks/{track-name}/tickets/01-{ticket}.md
/quality-check
/validate-spec .sapiens/tracks/{track-name}/tickets/01-{ticket}.md
/create-mr
```

## Definition of Done

- [ ] All tickets implemented and merged
- [ ] All acceptance criteria validated (`/validate-spec`)
- [ ] Quality gates passing (`/quality-check`)
- [ ] Track completed and delivery report generated (`/complete-track`)
```

**`.sapiens/tracks/{track-name}/TRACK-INFO.md`**:
```markdown
# Track Info: {track-name}

Status: Value Analysis Ready
Created: {date}
Last updated: {date} (by /create-epic)
Epic: {Epic Title}
Tickets: {N}
Progress: 0/{N} tickets done
Estimated Complexity: {Small/Medium/Large}
```

> Valid statuses (Kanban): `Value Analysis` → `Value Analysis Ready` → `Value Engineering` → `Value Engineering Ready` → `Delivery` → `Delivery Ready` → `Done`
>
> Auto-first reference: create-epic can keep track in `Value Analysis Ready` until delivery starts; status transitions must remain explicit in command output.

### Phase 5: Backend Sync (if configured)

If `ticket_backend` is set to `notion` or `gitlab`:

**Notion** (`ticket_backend=notion`):
- If an Epic page already exists (created by `/value-analysis`): update its status to `Value Engineering Ready`, add ticket sub-pages
- If no page exists: create Epic page + one sub-page per ticket in the configured database
- Each ticket sub-page includes: title, motivation, acceptance criteria (BDD format), estimated complexity

**Template source of truth (Notion track page):**
- Always render the track page content from `.sapiens/core/skills/notion/track-page.md`.
- Variables to populate:
  - `track_name`
  - `brief_summary`
  - `ticket_count`
  - `database_url` (from `backend_config.database_id`)

**Board view requirement (track page):**
- After creating the track and tickets, create a board view named `🎫 Tickets` scoped to this track only.
- Target filter logic:
  - `Type = ticket`
  - `Track contains {track_page}`
  - Group by `Ticket Status`
- View type must be **board/kanban** (not table).

**Fallback if MCP view creation fails (tool/API limitation):**
1. Do **not** block epic creation.
2. Append a `## 🎫 Tickets (track scope)` section to the track page with links to all ticket pages.

**Important:** if `.sapiens/core/skills/notion/track-page.md` is missing, warn and continue with empty track body (do not improvise structure).
3. Add explicit manual instruction in the page:
   - Create a linked board view from the main SAPIENS database
   - Filters: `Type = ticket` AND `Track contains {track_name}`
   - Group by: `Ticket Status`
4. Report in summary that board auto-creation failed and fallback was applied.

**GitLab** (`ticket_backend=gitlab`):
- If an Epic already exists: update its label to `value-engineering-ready`, create child Issues for each ticket
- If no Epic exists: create Epic + child Issues
- Each Issue includes: ticket content as description, label matching ticket complexity

This sync is mandatory when `ticket_backend` is configured — do not ask for confirmation, proceed directly.

### Phase 6: Summary

```
## ✅ Epic Created: {epic-title}

Track: .sapiens/tracks/{track-name}/
Tickets: {N} created

Ticket breakdown:
  00-reference.md        — Architecture context
  01-{ticket}.md         — {description} ({complexity})
  02-{ticket}.md         — {description} ({complexity})
  ...

Total estimated effort: ~{N}h

Next step:
  Read IMPLEMENTATION-GUIDE.md then:
  /implement-ticket .sapiens/tracks/{track-name}/tickets/01-{first-ticket}.md
```

## Error Handling

**If track already exists:**
```
⚠️  Track '{track-name}' already exists at .sapiens/tracks/{track-name}/

Options:
  - Choose a different name: /create-epic "{description}" → rename manually
  - Resume existing track: see .sapiens/tracks/{track-name}/IMPLEMENTATION-GUIDE.md
```

**If input is too vague:**
```
⚠️  Need more information to decompose this epic.

Please clarify:
  1. {specific question}
  2. {specific question}

Or provide a Figma/Notion/GitLab link for richer context.
```

## Quality Notes

- Prefer 3-5 tickets for most epics — avoid over-decomposition
- Each ticket must be independently reviewable (one MR per ticket)
- Acceptance criteria must be testable — avoid vague criteria like "works correctly"
- If an epic exceeds 8 tickets, consider splitting into two epics
