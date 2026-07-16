# CLAUDE.md

Context for Claude Code when working in this repository.

## What this repo is

TBT-DS (Teibto Design System) — Lit 3 Web Components for NetSuite Suitelet
custom HTML pages, plus reference Suitelet/RESTlet backends under `netsuite/`.

- Client/Project code: `internal` (Teibto's own tool, no client IP involved)
- Data classification: **Internal** — no credentials in logs; synthetic or
  internal test data only; never commit real NetSuite account data
- Governance profile: **standard** (PR + 1 reviewer, squash-only, quality-gate CI)

## Team standards (canonical source)

This repo follows the Teibto playbook at
[`Teibto/teibto-dev-standards`](https://github.com/Teibto/teibto-dev-standards)
— applied version: **tag `v0.13.0`**. Do not copy rules here; read them there.
Rules this repo hits most often:

1. **R6 — No secrets in git.** Run `bash scripts/secret-scan.sh` before every
   commit. The script is canonical from `teibto-dev-standards` — never edit it
   per-repo; open an issue there instead. Same for `.github/workflows/quality-gate.yml`.
2. **R7 — Tag = release.** `vMAJOR.MINOR.PATCH` per this repo's own version
   (`package.json` + CHANGELOG `[Unreleased]` → release). Features live on branches.
3. **R2 — Dates** are `YYYY-MM-DD` everywhere.
4. **R1 — Authorship.** New/rewritten source files: `@author Wichit Wongta` +
   `@since YYYY-MM-DD`. Never a company name, never a guessed name.
5. **CLI mirrors templates.** `gh issue create` / `gh pr create` bypass GitHub
   forms — when opening from CLI, reproduce every section of
   `.github/ISSUE_TEMPLATE/*.yml` / `.github/PULL_REQUEST_TEMPLATE.md` in the body.

## Commands

```sh
npm run serve        # Dev server (port 8081) — open demo/specimen.html
npm run lint         # Governance checks (no hex colors, tokens only, ...)
npm test             # Unit tests (@web/test-runner + Chromium)
npm run build        # Bundle dist/tbt-ds.min.js + dist/tbt-theme.css
npm run test:smoke   # Page smoke tests (needs build first)
```

## Layout

| Path | Purpose |
|------|---------|
| `components/` | One Lit component per file (`tbt-*.js`); registered in `index.js` |
| `theme/tbt-theme.css` | All design tokens (`--tbt-*`) — the only source of colors/spacing |
| `templates/` | Suitelet page templates (`sl_*.js`) + HTML compositions |
| `netsuite/` | Reference backends (bill receipt, expense claim) + `DEPLOY.md` |
| `demo/` | Interactive showcases (`specimen.html` = component gallery) |
| `rfcs/` | Component proposals — required before adding a new component |
| `tests/` | One test file per component |
| `dist/` | Build output (gitignored except hand-authored `tbt-page-runtime.js`) |

## Hard rules of this repo

1. No hex color literals in `components/**/*.js` — use `var(--tbt-*)` tokens
   (`npm run lint` enforces this).
2. Pages consuming the DS: no `<style>` blocks, no raw HTML primitives when a
   `tbt-*` component exists.
3. New component → RFC in `rfcs/` first.
4. Sentence case for UI labels ("Document info", not "Document Info").
5. Every change: update `CHANGELOG.md` `[Unreleased]`; production references
   pin exact versions (`/SuiteScripts/Teibto/ds/v<X.Y.Z>/`), never latest.
6. Code in English; comments may mix Thai.

Pitfalls when building components or Suitelet templates: see the
`tbt-ds-pitfalls` skill (sticky/overflow traps, popup clipping, view/edit
mode regressions, and friends).
