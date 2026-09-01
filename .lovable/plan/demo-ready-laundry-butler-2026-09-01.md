# Demo-ready Laundry Butler

Goal: a UI that looks convincing in a stakeholder demo — a welcoming landing page up front, and every screen filled with realistic data that responds to clicks, with no live API needed.

## 1. Welcome page at `/`

A marketing-style landing page instead of the dashboard:

- Hero: product name, one-line pitch ("Laundry bookings, sorted — no notice board, no double bookings"), and a primary "Open the dashboard" button plus a secondary "Try the assistant" link.
- Three feature cards: fixed two-hour slots, no double-bookings, book by chat.
- A small "how it works" strip (pick a day → grab a free slot → get reminded).
- A generated hero image of a bright modern laundry room, used as the page's `og:image`.
- Uses the same colour tokens as the app, but without the sidebar — a clean full-width page.

The dashboard moves to `/dashboard`; the sidebar links and the health pill stay as they are, with a "Home" link back to the landing page.

## 2. Hardcoded demo data instead of the API

Right now every screen calls a FastAPI backend that isn't configured, so all pages show "Couldn't reach the laundry API". For the demo the app switches to a local dataset:

- `src/data/laundry-demo.json` — seed bookings for residents named `test1`…`test6`, spread across yesterday, today and the next week, so the dashboard, calendar, week grid and residents table all look populated and none of the slot grids are empty or fully booked.
- `src/lib/laundry-mock.ts` — an in-memory store seeded from that JSON that implements the same operations the API had: list slots for a date (08:00–22:00, two-hour blocks), list bookings, create, reschedule, cancel, plus a scripted chatbot reply. It enforces the same rules (a slot can only be taken once, invalid slot rejected) so error toasts still demo well.
- The existing query/mutation layer keeps its current shape; only the data source swaps, so booking, rescheduling and cancelling all update the UI instantly during the demo. Changes live in memory for the session and reset on reload.
- The API health pill reads "Demo data" instead of showing an error.
- The assistant returns canned but sensible replies and actually creates/cancels bookings for simple phrases ("book tomorrow at 10", "cancel my booking"), so the chat tab isn't a dead end.

The server-function file stays in the repo (unused) so switching back to the real API later is a one-line change.

## Technical notes

- New route files: `src/routes/index.tsx` becomes the landing page; `src/routes/dashboard.tsx` holds the current dashboard, with its own `head()` metadata.
- `src/lib/laundry-queries.ts` points its `queryFn`s at the mock store; query keys and mutation invalidation stay unchanged.
- Mock store state is created lazily (not at module scope) to stay SSR-safe.
- Every route keeps distinct title/description/og metadata.
