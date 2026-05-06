# AGENTS.md

## Project Overview

- Project: JSONMind
- Purpose: browser-based JSON editor and mind map visualizer
- Stack: React 18, TypeScript, Vite 5, Tailwind CSS, Zustand, React Flow, Dagre
- Entry point: `src/main.tsx`

## Development Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`
- Preview build: `npm run preview`
- Lint: `npm run lint`

## Repository Layout

- `src/App.tsx`: top-level split layout between editor and mind map
- `src/components/`: UI components, including editor, canvas, modals, and node renderers
- `src/store/useJsonStore.ts`: central Zustand store for JSON text, parsed object, selection, and mutations
- `src/utils/`: JSON parsing/highlighting and graph helpers
- `src/config/`: shared constants
- `docs/`: static documentation assets

## Working Conventions

- Keep changes localized and consistent with the current React + TypeScript style.
- Prefer extending the existing Zustand store actions instead of introducing parallel state containers.
- Preserve the bidirectional behavior between the editor and the mind map.
- Reuse existing utility modules for JSON-path, parsing, and graph operations before adding new helpers.
- Keep UI changes aligned with the existing Tailwind-based visual language unless the task explicitly asks for redesign.

## Validation

- For code changes, prefer verifying with `npm run build`.
- Run `npm run lint` only if the lint configuration is present and working for the repo state you are modifying.
- If behavior changes affect interactions, manually verify the editor, node selection, node editing, and export flow in the browser.

## Notes For Agents

- This repo currently appears to be frontend-only; do not assume a backend service exists.
- There is no dedicated test suite configured in the visible project files; rely on build validation and targeted manual checks unless tests are added.
- Avoid large structural refactors unless they are required by the task.
