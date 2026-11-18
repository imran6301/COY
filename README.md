# Coy Discover

A swipe-based "Discover" tab for Coy, built as a standalone app for the Coy SDE Intern assignment.
The Home tab is intentionally blank; all functionality lives in the Discover tab.

**Part A (feature suggestions):** see [PART_A.md](./PART_A.md)

## Features
- 32 seeded profiles (name, age, photo, bio, city/college, interests); 12 have already liked you, so matches are easy to demo
- One card at a time: drag to swipe on mobile, ✕ / ♥ buttons on desktop, with tilt animation and LIKE / NOPE stamps
- A swiped profile never appears again
- "It's a match!" screen, a Matches view (toggle at the top of Discover), and empty states
- Swipes and matches persist across reloads

## Tech stack
Next.js (App Router) + TypeScript + Tailwind CSS. API routes are the backend. Data is stored in a JSON file (`data/state.json`). Tests use Vitest.

## Run locally
```bash
git clone https://github.com/imran6301/COY.git
cd COY
npm install
npm run dev     # http://localhost:3000
npm test        # runs the 13 unit tests
```
Use your browser's phone view (F12, then Ctrl+Shift+M) to try the drag gestures.
To reset the demo, delete `data/state.json`.

## Project structure
```
app/api/        feed, swipe and matches API routes (thin wrappers)
app/page.tsx    tab bar: blank Home + Discover
components/     TabBar, DiscoverTab (swipe cards), MatchModal, MatchesView
lib/logic.ts    pure rules: feed filtering, matching, privacy stripping
lib/store.ts    reads and writes data/state.json
lib/profiles.ts 32 seeded profiles
tests/          Vitest unit tests for the logic
```

## API
| Method | Route | Description |
|---|---|---|
| GET | `/api/feed` | Profiles you have not swiped on yet |
| POST | `/api/swipe` | Body `{ "profileId": number, "action": "like" \| "pass" }`. Returns `{ matched, match }`. 409 if already swiped, 404 if unknown |
| GET | `/api/matches` | Your mutual matches, newest first |

## Design decisions
- **Privacy first:** the `likesMe` flag exists only on the server. Profiles are converted with `toPublic()` before leaving the API, so the browser can never learn who liked you unless it is a mutual match. Tests check this.
- **Pure logic, thin routes:** all rules live in `lib/logic.ts` (no file access), which makes them easy to test. `lib/store.ts` only reads and writes JSON.
- **Server-enforced rules:** the server rejects duplicate swipes (409), so "never show a profile twice" does not depend on the UI.
- **Single user:** no auth, as the assignment says.
- **No gesture library:** drag uses native pointer events, which work for both mouse and touch.

## Known limitations / next steps
- JSON file storage is not safe for concurrent writes; a real database (Postgres/SQLite) would replace `lib/store.ts`
- Because it writes to a local file, it needs a normal server and will not work on read-only serverless hosting
- Photos are placeholders from pravatar.cc, so they need an internet connection
- No auth, undo, filters, pagination or real photo uploads