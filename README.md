# Museboard

Museboard is a calm, creative-first to-do space for turning ideas into finished work. It is built with Next.js, TypeScript, and browser-local persistence.

## What it includes

- Create, categorize, complete, star, rename, and remove tasks
- A freeform note space for every task
- An optional focus mode and light/dark theme
- First-visit onboarding with a personalized workspace
- `localStorage` persistence: no account, server, or database required

## Run it locally

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
pnpm lint
pnpm format:check
pnpm build
```

## Deploy with Vercel

1. Sign in to [Vercel](https://vercel.com) with the GitHub account that owns this repository.
2. Import `holydev001/kaizen-todo` as a new project.
3. Keep Vercel's detected **Next.js** framework preset and default build settings.
4. Select **Deploy**. No environment variables are required.

Vercel will provide a public URL and create preview deployments for pull requests. After the project is linked, merges to `main` automatically publish the production deployment.

## Notes on data

All task and profile data stays in the visitor's browser under the `museboard-tasks` and `museboard-profile` local-storage keys. Clearing browser site data resets the workspace intentionally.

## Working with AI

This app was built collaboratively through AI-assisted planning, implementation, testing, and GitHub pull-request workflows. Project-specific instructions for future AI work are in [agents.md](./agents.md).
