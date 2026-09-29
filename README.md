# Museboard

Museboard is a calm, creative-first to-do app for capturing ideas and turning them into small, focused actions. It keeps tasks, notes, profile details, and preferences in the browser, so no account is required.

## Highlights

- Create, organize, complete, prioritize, rename, and remove tasks
- Add notes and open a focused detail view for each task
- Browse work through Home, Planner, and History views
- Filter tasks by priority, to-do, and completion state
- Personalize your name, profile photo, and theme
- Start a 25-minute focus session for any task

## Stack

- Next.js 15 with the App Router
- React 19 and TypeScript
- CSS for the responsive, no-rounded-card interface
- Lucide React for interface icons
- Browser `localStorage` for persistence

## Run locally

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the development server:

   ```bash
   pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
pnpm format:check
pnpm lint
pnpm build
```

## Data privacy

Museboard stores data only in the current browser. Clearing browser site data resets the workspace.
