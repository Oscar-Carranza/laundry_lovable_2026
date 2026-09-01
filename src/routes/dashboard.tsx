import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, Clock, Users, WashingMachine } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { ErrorState, LoadingState } from "@/components/ApiState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  bookingsQuery,
  buildResidents,
  formatDateLabel,
  formatSlot,
  slotsQuery,
  todayIso,
} from "@/lib/laundry-queries";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Laundry Butler — Booking Dashboard" },
      {
        name: "description",
        content:
          "Live overview of laundry room bookings: today's slot occupancy, upcoming reservations and active residents.",
      },
      { property: "og:title", content: "Laundry Butler — Booking Dashboard" },
      {
        property: "og:description",
        content: "Live overview of laundry room bookings, slot occupancy and residents.",
      },
    ],
  }),
  component: Dashboard,
});

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  hint?: string | undefined;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="size-4 text-primary" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const today = todayIso();
  const slots = useQuery(slotsQuery(today));
  const bookings = useQuery(bookingsQuery());

  const isPending = slots.isPending || bookings.isPending;
  const error = slots.error ?? bookings.error;

  const slotList = slots.data ?? [];
  const bookingList = bookings.data ?? [];
  const todays = bookingList.filter((b) => b.date === today);
  const upcoming = bookingList
    .filter((b) => b.date >= today)
    .sort((a, b) => (a.date === b.date ? a.slot_start - b.slot_start : a.date.localeCompare(b.date)));
  const nextFree = slotList.find((s) => s.available);
  const residents = buildResidents(bookingList);

  return (
    <AppShell title="Dashboard" description={`Laundry room status for ${formatDateLabel(today)}`}>
      {error ? (
        <ErrorState error={error} />
      ) : isPending ? (
        <LoadingState label="Loading laundry data…" />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat
              icon={WashingMachine}
              label="Free slots today"
              value={`${slotList.filter((s) => s.available).length}/${slotList.length}`}
              hint={nextFree ? `Next free: ${nextFree.label}` : "Fully booked"}
            />
            <Stat icon={CalendarCheck} label="Bookings today" value={`${todays.length}`} />
            <Stat
              icon={Clock}
              label="Upcoming bookings"
              value={`${upcoming.length}`}
              hint={upcoming[0] ? `Next: ${formatDateLabel(upcoming[0].date)}` : undefined}
            />
            <Stat icon={Users} label="Active residents" value={`${residents.length}`} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Today's slots</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {slotList.map((slot) => (
                  <div
                    key={slot.slot_start}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{slot.label}</span>
                    {slot.available ? (
                      <Badge variant="secondary">Free</Badge>
                    ) : (
                      <span className="text-muted-foreground">{slot.booked_by}</span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upcoming bookings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcoming.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming bookings.</p>
                ) : (
                  upcoming.slice(0, 8).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{booking.user}</span>
                      <span className="text-muted-foreground">
                        {formatDateLabel(booking.date)} · {formatSlot(booking.slot_start)}
                      </span>
                    </div>
                  ))
                )}
                <Link
                  to="/bookings"
                  className="inline-block pt-2 text-sm font-medium text-primary hover:underline"
                >
                  Manage bookings →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  );
}
