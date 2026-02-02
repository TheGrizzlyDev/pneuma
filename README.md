# Breathing Companion (Offline-First PWA)

A local-only, offline-first breathing companion built with a simple stack: React + Vite + TypeScript. Data is stored only in `localStorage` under the key `bp_breathing_app_v1` and never leaves the device.

## Why a simple stack
- React + Vite + TypeScript keep the build pipeline fast and transparent.
- No heavy state libraries: state is managed with small hooks and pure domain functions.
- UI and platform adapters depend on stable interfaces so the core domain stays testable.

## TDD workflow (Red → Green → Refactor)
1. **Red**: Write a failing test for domain behavior (schedule planning, pacer state machine, reminders, storage migration).
2. **Green**: Implement the minimal code to pass tests.
3. **Refactor**: Improve readability without changing behavior.
4. Add minimal UI that calls the tested domain behavior.

### How to run tests
- `npm test` for watch mode.
- `npm run test:run` for a single run.

### Testing priorities
- Most logic lives in `src/domain` and is unit-tested.
- Component tests are minimal and focused (Player rendering).
- No heavy E2E suite; keep smoke tests optional and limited.

## Architecture overview
- `src/domain`: pure functions for schedule building, pacer state machine, reminders.
- `src/platform`: browser adapters for time, notifications, audio, haptics.
- `src/storage`: localStorage persistence + migrations.
- `src/pages` + `src/ui`: UI and routes, built on domain + adapters.

## PWA install steps
1. Run `npm install` then `npm run dev`.
2. Open the app in a browser on your device.
3. Use the browser menu to **Add to Home Screen**.

## Reminder limitations (important)
- Mobile browsers, especially iOS Safari, do not reliably support background notifications.
- This app’s **in-app banner** on load/focus is the reliable reminder mechanism.
- Notifications are best-effort while the app is open.

## How to add a new exercise or template safely
1. Add the new exercise in `src/seed.ts`.
2. Update any schedule/reminder expectations in domain tests if needed.
3. Add or update a routine template in `src/seed.ts`.
4. Run `npm run test:run` to validate.

## Development methodology in practice
- Domain logic is isolated in `src/domain` and called by the UI.
- Ports and adapters: UI depends on small interfaces for clock, notifications, audio, and haptics.
- TDD-first workflow is codified by tests in `tests/` and referenced in domain comments.

## Scripts
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run test:run`
