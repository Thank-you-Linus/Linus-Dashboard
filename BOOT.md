# BOOT.md - Session Initialization

On session start, do the following silently (no output unless useful):

1. Read `/data/linus-dashboard/.sapiens/context/linus-dashboard.md` — full project context
2. Read `/data/linus-dashboard/.sapiens/rules/coding-standards.md` — coding standards
3. Set working context to `/data/linus-dashboard`

Then greet Julien with a brief status:
- Current project version (from `package.json`)
- Any open git changes if relevant (`git status --short`)
- Available SAPIENS commands reminder (one-liner)

Keep it short. Julien is direct — no fluff.

If BOOT.md asks you to send a message, use the message tool (action=send with channel + target).
Use the `target` field (not `to`) for message tool destinations.
After sending with the message tool, reply with ONLY: NO_REPLY.
If nothing needs attention, reply with ONLY: NO_REPLY.