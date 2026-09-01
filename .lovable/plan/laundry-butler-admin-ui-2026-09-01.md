# Laundry Butler — Admin UI

A React dashboard for the Laundry Booking API (the FastAPI backend in your "Laundry Butler Bot" project), laid out like the Hotel-Management reference: fixed sidebar, top bar, content area, one page per section.

## What the API actually offers

I read the backend. It exposes exactly these endpoints:

- `GET /health`
- `GET /slots?date=YYYY-MM-DD` — every 2h slot from 08:00 to 22:00 with `available` and `booked_by`
- `GET /bookings?user=` — all bookings, optionally filtered by user
- `POST /bookings` — `{ user, date, slot_start }`
- `PATCH /bookings/{id}` — reschedule `{ date, slot_start }`
- `DELETE /bookings/{id}`
- `POST /chat` — `{ user, message }` -> `{ reply }` (the booking chatbot)

There are no machines, rooms, or user accounts in the backend — one shared laundry room with fixed 2-hour slots, and users are just name strings on bookings. So:

- "Machines/rooms admin" has nothing to manage yet; instead the UI gets a **Slots** page showing the configured daily slot grid and its occupancy. If you want real multi-machine support, that needs backend changes first.
- "Users/residents" becomes a **Residents** page derived from booking data (unique users, booking counts, upcoming/past), not account management.

## Pages

1. **Dashboard** — today's slot occupancy, counts of today/upcoming bookings, active residents, next free slot, API health indicator, recent bookings list.
2. **Bookings** (calendar) — date picker + day view of the slot grid; book a free slot, reschedule or cancel an existing one. Also a table of all bookings with a user filter.
3. **Slots** — the fixed daily schedule (08:00–22:00, 2h blocks) with a week-at-a-glance availability grid.
4. **Residents** — list of users derived from bookings, with their booking history and a per-user filter link into Bookings.
5. **Assistant** — chat panel talking to `POST /chat`, so bookings can be made conversationally; the booking views refresh after each reply.

## Technical notes

- **Calls go through server functions, not the browser.** The FastAPI app has no CORS middleware, so direct browser fetches would be blocked. A thin set of `createServerFn` wrappers in `src/lib/laundry.functions.ts` proxies each endpoint server-side and adds the auth header.
- **Config as secrets**: `LAUNDRY_API_BASE_URL` and `LAUNDRY_API_KEY` (sent as a header, name configurable — default `X-API-Key`). Note the backend currently doesn't check any key; the header is sent anyway so it works once you add auth there. I'll request these via the secure secret form after you approve.
- **Data layer**: TanStack Query with `ensureQueryData` in route loaders + `useSuspenseQuery` in components; mutations invalidate the slot/booking queries.
- **Routes**: `index.tsx` (dashboard), `bookings.tsx`, `slots.tsx`, `residents.tsx`, `assistant.tsx`, with the sidebar shell in `__root.tsx`. Each page gets its own `head()` metadata.
- **Design**: shadcn components on a distinctive laundry-themed token set (cool water blues + warm neutral, not the default palette), dark mode included.
- Errors from the API (slot taken, invalid slot) surface as inline messages/toasts using the FastAPI `detail` text.

## Out of scope for now

Real machine/room entities and authenticated resident accounts — both require backend work in the Laundry Butler Bot project first.
