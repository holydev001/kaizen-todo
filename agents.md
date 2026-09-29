# Museboard agent guide

## Product intent

Museboard is a calm, creative-first to-do app. Protect its editorial feel: spacious layout, no rounded cards, warm green/yellow palette, and language that encourages momentum rather than guilt.

## Stack and structure

- Next.js App Router with TypeScript.
- Keep route UI in `app/`; global styles live in `app/globals.css`.
- Prefer small, accessible native controls before adding dependencies.
- Task data is intentionally local-only for this assignment; use `localStorage` for persistence.

## Coding conventions

- Use strict TypeScript and explicit domain types.
- Use `camelCase` for variables/functions, `PascalCase` for React components and types.
- Keep event handlers close to the UI that owns them.
- Avoid unnecessary abstractions until the same behavior appears in at least two places.
- Preserve the no-border-radius visual language unless a future request explicitly changes it.

## Validation

- Run `npm run lint`, `npm run format:check`, and `npm run build` before considering work complete.
- Test adding a task, changing its category through the UI when available, completing it, starring it, editing notes, switching theme, and refreshing the page.
- Test onboarding from a clean browser cache: save a name, complete or skip the tour, then refresh and confirm the personalized workspace remains visible without reopening the tour.
- Check keyboard labels and focus behavior for every interactive control.

## Git workflow

- Branch names use `feat/`, `fix/`, or `chore/` prefixes.
- Commit messages use Conventional Commits, e.g. `feat: add local task persistence`.
- Keep commits focused and explain user-visible behavior in the body when useful.
