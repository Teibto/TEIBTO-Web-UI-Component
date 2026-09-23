<!-- @author Wichit Wongta -->
<!-- @since 2026-08-21 -->

# Repository agent instructions

This repository is the Lit 3 Teibto Design System and its Suitelet integration examples. Preserve
the source-of-truth and release rules in `CLAUDE.md` when coordinating multiple coding agents.

## Start here

- Read `CLAUDE.md`, `docs/UI-PLAYBOOK.md`, and the relevant RFC or component tests.
- Invoke `tbt-ds-pitfalls` before risky component, CSS-in-JS, sticky, overflow, popover, view/edit,
  generated-page, or browser-runtime work.
- Inspect the working tree first and preserve unrelated changes.

## Repository invariants

- `theme/tbt-theme.css` is the only color and spacing token source. Components contain no hex
  colors, and consumers do not replace available `tbt-*` components with raw primitives.
- A new component requires an RFC. UI labels use sentence case.
- Every change updates CHANGELOG `[Unreleased]`; production imports pin an exact release version.
- Browser runtime verification is part of done. A successful build alone cannot prove that Lit
  static initialization, popovers, sticky layout, or save/refresh flows work.
- Use synthetic or Internal data and never commit credentials or live account data.
- New or substantially rewritten source files follow the authorship rule in `CLAUDE.md`.

## Change workflow

- Follow the issue, branch, PR, and squash flow in `CONTRIBUTING.md`. Do not create external state
  unless the user asks for it.
- Assign each writing agent a non-overlapping component, template, test, or backend file set.
- Run `python scripts/validate-ai-workspace.py` after changing agents or skills.
- Keep browser writes, NetSuite saves, deploys, releases, and other live effects with the primary
  agent under the normal human gate.

## Multi-agent coordination

- `tbt-ds-explorer` maps component APIs, tokens, consumers, RFCs, and affected tests without editing.
- `component-implementer` owns one explicit component/template/test slice and verifies it locally.
- `visual-accessibility-reviewer` independently reviews hierarchy, responsive behavior, dark mode,
  keyboard/ARIA behavior, popovers, and browser-console risks without editing.
- `netsuite-template-reviewer` independently reviews Suitelet integration, data boundaries, version
  pins, server-derived identity, and real save/refresh risks without editing.
- Do not run writing agents concurrently when they can rebuild or touch the same generated bundle.

Codex discovers profiles in `.codex/agents/`; Claude Code discovers matching profiles in
`.claude/agents/`.

## Skills and validation

The canonical `tbt-ds-pitfalls` skill lives in `.claude/skills/`; Codex uses the project entrypoint
under `.agents/skills/`. Update the canonical skill and its references when a repeated failure has
been proven, then keep the Codex entrypoint routed to it.

```sh
npm ci
npm run lint
npm test
npm run build
npm run test:smoke
npm run test:visual
bash scripts/secret-scan.sh
python scripts/validate-ai-workspace.py
```

For UI risk, also check the console, 375 px and 768 px layouts, dark mode, axe critical findings,
and a real save/refresh flow when Suitelet integration changed.
