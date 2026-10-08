# Command: /value-analysis

Structure a product need with the PM before creating tickets — conduct value analysis interview and produce a validated brief.

**Product Idea or Context** (required): $ARGUMENTS

## Examples

### Basic Usage

**When to use**: PM has an idea and needs to structure it before creating tickets

```
/value-analysis "Users want to export their dashboard"
```

**Result**: Conducts a 5-question interview with the PM. Captures: target users (analytics team), job-to-be-done (share KPIs with management), constraints (PDF format, max 2 pages), success definition (50% reduction in manual report requests). Creates `.sapiens/tracks/dashboard-export/NEED-BRIEF.md` and `TRACK-INFO.md` with `Status: Value Analysis Ready`. Ready for `/create-epic`. Takes ~5 minutes.

---

### Advanced Usage

**When to use**: PM has an existing Notion page, Figma, or GitLab/GitHub issue

```
/value-analysis https://notion.so/page/abc123
```

**Result**: Reads the Notion page via MCP. Extracts existing context. Asks only the missing questions (3 instead of 7). Produces richer NEED-BRIEF.md with direct quotes from the source document. Takes ~3 minutes.

---

## Workflow

### Phase 1: Parse Input

1. Parse `$ARGUMENTS`:
   - If URL → fetch content via MCP (Notion, Figma, GitLab issue, GitHub issue)
   - If free text → use as starting context
   - **Do not use web search** unless $ARGUMENTS is explicitly a URL

2. Check if a track already exists for this topic:
   - If `.sapiens/tracks/` contains a matching directory → ask if resuming or starting fresh
   - Generate candidate track name in kebab-case

3. Read `.sapiens/tools` if present:
   - Check `ticket_backend` key (`filesystem` / `local` / `notion` / `gitlab` / `github`)
   - Store for Phase 5

### Phase 2: Value Analysis Interview

Conduct a structured interview with 5-7 targeted questions. Adapt based on context already available from Phase 1 (skip questions already answered).

**Core questions**:

1. **Target users**: Who will use this feature? (role, team, volume)
2. **Job-to-be-done**: What are they trying to accomplish that they cannot do today?
3. **Success definition**: How will we know this feature is successful? What metric changes?
4. **Constraints**: Any technical, design, timeline, or regulatory constraints to be aware of?
5. **Out of scope**: What explicitly should NOT be included in this version?
6. **Dependencies**: Does this depend on another feature, team, or external system?
7. **Priority signal**: Is there a deadline or event driving urgency?

Present all questions as a **numbered list in a single message** — do not ask one at a time. Skip questions already answered from Phase 1 context (URL input).

### Phase 3: Synthesize Brief

Once the PM has answered, synthesize into a `NEED-BRIEF.md`:

**`.sapiens/tracks/{track-name}/NEED-BRIEF.md`**:
```markdown
# Need Brief: {Feature Name}

## Problem Statement
{One paragraph: what problem exists, for whom, and why it matters now}

## Target Users
{Role, team size, usage frequency}

## Job-to-be-Done
{What users are trying to accomplish — focus on the outcome, not the feature}

## Success Criteria
- [ ] {Measurable outcome 1}
- [ ] {Measurable outcome 2}

## Constraints
- {Technical, design, regulatory, or timeline constraints}

## Out of Scope
- {Explicitly excluded items for this version}

## Dependencies
- {Other features, teams, or systems this depends on}

## Priority Signal
{Deadline, event, or business driver — or "none"}

## Source
{Free text / Notion URL / Figma URL / Issue URL}
```

### Phase 4: Create Track Structure

Create or update the track directory:

**`.sapiens/tracks/{track-name}/TRACK-INFO.md`**:
```markdown
# Track Info: {track-name}

Status: Value Analysis Ready
Created: {date}
Last updated: {date} (by /value-analysis)
Epic: {Feature Name}
Tickets: 0 (pending /create-epic)
Progress: 0/0
Estimated Complexity: TBD
```

> Valid statuses (matching team Kanban): `Value Analysis` → `Value Analysis Ready` → `Value Engineering` → `Value Engineering Ready` → `Delivery` → `Delivery Ready` → `Done`

If the PM is not yet ready to validate (needs to check with team), set status to `Value Analysis` instead of `Value Analysis Ready`.

### Phase 5: Backend Sync (if configured)

If `ticket_backend` in `.sapiens/tools` is set to `notion` or `gitlab`:

**Notion** (`ticket_backend=notion`):
- Use the Notion MCP to create a new page in the configured database (`ticket_backend_database`)
- Page title: `{Feature Name}`
- Page status property: `Value Analysis Ready`
- Page content: paste NEED-BRIEF.md content

**GitLab** (`ticket_backend=gitlab`):
- Use the GitLab MCP to create an Epic in the configured project (`ticket_backend_project`)
- Epic title: `{Feature Name}`
- Epic description: NEED-BRIEF.md content
- Epic label: `value-analysis-ready`

This sync is mandatory when `ticket_backend` is configured — do not ask for confirmation, proceed directly.

### Phase 6: Summary

```
## ✅ Value Analysis Complete: {feature-name}

Track: .sapiens/tracks/{track-name}/
Status: Value Analysis Ready
Brief: .sapiens/tracks/{track-name}/NEED-BRIEF.md

Key insights:
  Target users    : {summary}
  Success metric  : {summary}
  Out of scope    : {summary}

Next step:
  /create-epic .sapiens/tracks/{track-name}/NEED-BRIEF.md
```

## Error Handling

**If PM cannot answer all questions yet:**
```
⏸  Value Analysis in progress — some questions unanswered.

Status set to: Value Analysis (not Ready)
Resume when ready: /value-analysis .sapiens/tracks/{track-name}/NEED-BRIEF.md
```

**If input is completely empty:**
```
⚠️  Please provide a product idea to analyze.

Usage: /value-analysis "Users should be able to export their dashboard"
Or:    /value-analysis https://notion.so/...
```

## Quality Notes

- Keep the brief to one page — this is a PM artifact, not a spec
- Success criteria must be measurable — avoid "users like it"
- Out of scope is as important as in scope — set expectations early
- NEED-BRIEF.md is the input to `/create-epic` — it replaces free text as the starting point
