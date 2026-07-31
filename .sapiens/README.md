# SAPIENS Configuration

This directory contains the **SAPIENS** configuration for this project.

## Directory Structure

```
.sapiens/
├── core/        → symlink to global SAPIENS (agents, commands, tools)
├── context/     ← Project-specific business context
├── rules/       ← Project-specific development rules
└── tracks/      ← Project feature implementation tracks
```

## Usage

### Available Agents
- Implementer: Full ticket implementation workflow
- Reviewer: Code review with structured feedback
- Quality Checker: Automated quality gates
- Architect: Design complex features

See `.sapiens/core/agents/` for details.

### Available Commands
- `/implement-ticket TICKET-123` - Implement feature ticket
- `/create-ticket` - Create structured ticket
- `/quality-check [package]` - Run quality checks
- `/create-mr` - Create merge request
- `/review-mr` - Review merge request

See `.sapiens/core/commands/` for details.

## Project Context

Add your project-specific context to:
- `context/` - Business domain knowledge, domain agents
- `rules/` - Coding standards, architecture principles
- `tracks/` - Feature implementation tracks

## Updating SAPIENS

Global SAPIENS is accessed via the `core/` symlink:

```bash
# Update global SAPIENS (affects all projects)
cd <path-to-sapiens-repo>
git pull

# Update project context
git add .sapiens/context/
git commit -m "docs: update project context"
```

## References

- Global SAPIENS docs: `.sapiens/core/README.md`
- Project technical docs: `CLAUDE.md` (if present)
