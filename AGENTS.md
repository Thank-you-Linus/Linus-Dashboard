# Instructions for AI coding agents (and their humans)

Linus Dashboard is a Home Assistant integration (`custom_components/linus_dashboard/`, Python) with a
TypeScript frontend (`src/`). Read this file before you change anything. [CONTRIBUTING.md](CONTRIBUTING.md)
covers the development environment.

## The frontend build is never committed

`npm run build` writes generated files to `custom_components/linus_dashboard/www/`: `linus-strategy.js`,
its `.map`, and about a hundred content-hashed chunks. They are ignored by git.

- Never push generated files from `www/`: do not force-add them, and do not edit them by hand.
- CI builds every pull request and publishes the result as the `build-output` artifact, and every
  release builds its own zip. Maintainers test your PR from that artifact.
- Build locally to test your change: without a build, Home Assistant has no dashboard to serve.
- A branch that changed `linus-strategy.js` conflicts with `main`. Resolve it by removing the file:
  `git rm --cached custom_components/linus_dashboard/www/linus-strategy.js*`. Remove any committed chunk
  the same way: it merges without a conflict and would stay tracked.
- The other files in `www/` (`browser_mod.js`, `custom-elements-guard.js`, `lovelace-mushroom/`,
  `lovelace-card-mod/`, `stack-in-card/`, `swipe-card/`) are committed third-party or static files. Leave
  them out of feature work.

## Checks to run before you push

Run what your change touches, and paste the results in the PR.

| Change | Command |
|---|---|
| Frontend install | `npm ci` |
| Frontend tests | `npx vitest run` |
| Types | `npm run type-check` |
| ESLint | `npm run lint:check` |
| Build | `npm run build` |
| Python lint | `python3 -m ruff check .` and `python3 -m ruff format . --check` |
| Python tests | `python3 -m pytest tests/python --ignore=tests/python/integration` |
| Integration tests (real HA) | `python3 -m pytest tests/python/integration`, in a separate environment with `pytest-homeassistant-custom-component` (see `.github/workflows/ci.yml`) |

Python dependencies are in `requirements.txt` and `requirements_test.txt`. CI reports ESLint and type
errors without failing the job, so read them yourself. CI does not run the frontend tests at all:
`npx vitest run` is on you. A bug fix comes with a test that fails without it.

Unit tests do not show that the dashboard works. For a visible change, run it in Home Assistant:
`npm run build`, then `make dev` (`make dev` only builds when no build exists, so it can serve an old
one), then reload the browser with the cache cleared. Say in the PR what you checked. If you could not
run it, say so.

## Rules that come up in review

- **Text and translations.** Never hardcode a user-facing string, in any language. Add every new key to
  both `custom_components/linus_dashboard/translations/en.json` and `fr.json`.
- **Documentation.** User documentation exists in English and French: update `README.md` and
  `README-fr.md` together, and both versions of a page in `docs/`.
- **Compatibility.** The minimum Home Assistant version is in `hacs.json`. Do not use an API that is newer
  than it without a guard.
- **Line endings.** Some files use CRLF (`README.md`, `CONTRIBUTING.md`). Keep them: the diff must show
  only the lines you changed, never a whole-file rewrite.
- **Versions.** Do not bump `package.json` or `manifest.json`. The release workflows do it.
- **Secrets.** Never commit `.env`, a token, or a Home Assistant instance URL.

## Pull requests

- One topic per PR, branched from an up-to-date `main`. Unrelated fixes go in their own PR.
- Write the title, description, code comments and commit messages in English.
- Start commit subjects with a type (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`): the release
  notes are sorted by it.
- Fill in the pull request template. Say what changed for the user and how you tested it.
- A pull request from a fork may wait for a maintainer to approve its CI run. A push after a review does not
  request a new one: say in the PR when it is ready again.
