import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { ErrorState, LoadingState } from "@/components/ApiState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  mockCancelBooking as cancelBooking,
  mockCreateBooking as createBooking,
  mockRescheduleBooking as rescheduleBooking,
} from "@/lib/laundry-mock";
import {
  addDays,
  bookingsQuery,
  formatDateLabel,
  formatSlot,
  slotsQuery,
  todayIso,
} from "@/lib/laundry-queries";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "Bookings — Laundry Butler" },
      {
        name: "description",
        content:
          "Browse the laundry slot calendar, book a free two-hour slot, reschedule or cancel existing bookings.",
      },
      { property: "og:title", content: "Bookings — Laundry Butler" },
      {
        property: "og:description",
        content: "Book, reschedule and cancel laundry room slots from one calendar view.",
      },
    ],
  }),
  component: BookingsPage,
});

function BookingsPage() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(todayIso());
  const [user, setUser] = useState("");
  const [filter, setFilter] = useState("");
  const [rescheduleId, setRescheduleId] = useState<number | null>(null);

  const slots = useQuery(slotsQuery(date));
  const bookings = useQuery(bookingsQuery(filter.trim() || undefined));

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["slots"] });
    void queryClient.invalidateQueries({ queryKey: ["bookings"] });
  };

  const book = useMutation({
    mutationFn: (slotStart: number) =>
      createBooking({ user: user.trim(), date, slot_start: slotStart }),
    onSuccess: () => {
      toast.success("Booking created");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const move = useMutation({
    mutationFn: (slotStart: number) =>
      rescheduleBooking({ id: rescheduleId!, date, slot_start: slotStart }),
    onSuccess: () => {
      toast.success("Booking rescheduled");
      setRescheduleId(null);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => cancelBooking(id),
    onSuccess: () => {
      toast.success("Booking cancelled");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleSlotClick = (slotStart: number) => {
    if (rescheduleId !== null) {
      move.mutate(slotStart);
      return;
    }
    if (!user.trim()) {
      toast.error("Enter the resident's name first");
      return;
    }
    book.mutate(slotStart);
  };

  return (
    <AppShell title="Bookings" description="Pick a day, then book, move or cancel a slot.">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Slot calendar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="w-44"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setDate(addDays(date, -1))}>
                  Prev
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDate(todayIso())}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDate(addDays(date, 1))}>
                  Next
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user">Resident name</Label>
              <Input
                id="user"
                placeholder="e.g. Oscar"
                value={user}
                onChange={(event) => setUser(event.target.value)}
                className="max-w-xs"
              />
            </div>

            {rescheduleId !== null ? (
              <div className="flex items-center justify-between rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm">
                <span>Pick a free slot to move booking #{rescheduleId}</span>
                <Button size="sm" variant="ghost" onClick={() => setRescheduleId(null)}>
                  Cancel
                </Button>
              </div>
            ) : null}

            {slots.error ? (
              <ErrorState error={slots.error} />
            ) : slots.isPending ? (
              <LoadingState label="Loading slots…" />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {slots.data.map((slot) => (
                  <button
                    key={slot.slot_start}
                    type="button"
                    disabled={!slot.available || book.isPending || move.isPending}
                    onClick={() => handleSlotClick(slot.slot_start)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-3 text-left text-sm transition-colors enabled:hover:border-primary enabled:hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span className="font-medium">{slot.label}</span>
                    {slot.available ? (
                      <Badge variant="secondary">Free</Badge>
                    ) : (
                      <span className="text-muted-foreground">{slot.booked_by}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle className="text-base">All bookings</CardTitle>
            <Input
              placeholder="Filter by resident"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="max-w-48"
            />
          </CardHeader>
          <CardContent>
            {bookings.error ? (
              <ErrorState error={bookings.error} />
            ) : bookings.isPending ? (
              <LoadingState label="Loading bookings…" />
            ) : bookings.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resident</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Slot</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...bookings.data]
                    .sort((a, b) =>
                      a.date === b.date
                        ? a.slot_start - b.slot_start
                        : a.date.localeCompare(b.date),
                    )
                    .map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.user}</TableCell>
                        <TableCell>{formatDateLabel(booking.date)}</TableCell>
                        <TableCell>{formatSlot(booking.slot_start)}</TableCell>
                        <TableCell className="space-x-2 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRescheduleId(booking.id);
                              setDate(booking.date);
                            }}
                          >
                            Reschedule
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            disabled={remove.isPending}
                            onClick={() => remove.mutate(booking.id)}
                          >
                            Cancel
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
