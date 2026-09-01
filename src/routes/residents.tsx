import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { EmptyState, ErrorState, LoadingState } from "@/components/ApiState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { bookingsQuery, buildResidents, formatDateLabel } from "@/lib/laundry-queries";

export const Route = createFileRoute("/residents")({
  head: () => ({
    meta: [
      { title: "Residents — Laundry Butler" },
      {
        name: "description",
        content:
          "Everyone using the laundry room, with booking counts, upcoming reservations and last activity.",
      },
      { property: "og:title", content: "Residents — Laundry Butler" },
      {
        property: "og:description",
        content: "Booking activity per resident, derived from the laundry booking API.",
      },
    ],
  }),
  component: ResidentsPage,
});

function ResidentsPage() {
  const [search, setSearch] = useState("");
  const bookings = useQuery(bookingsQuery());
  const residents = buildResidents(bookings.data ?? []).filter((resident) =>
    resident.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <AppShell title="Residents" description="Derived from booking history — no accounts required.">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Booking activity</CardTitle>
          <Input
            placeholder="Search residents"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="max-w-56"
          />
        </CardHeader>
        <CardContent>
          {bookings.error ? (
            <ErrorState error={bookings.error} />
          ) : bookings.isPending ? (
            <LoadingState label="Loading residents…" />
          ) : residents.length === 0 ? (
            <EmptyState>No residents have booked a slot yet.</EmptyState>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resident</TableHead>
                  <TableHead>Total bookings</TableHead>
                  <TableHead>Upcoming</TableHead>
                  <TableHead>Next slot</TableHead>
                  <TableHead>Last booking</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {residents.map((resident) => (
                  <TableRow key={resident.name}>
                    <TableCell className="font-medium">{resident.name}</TableCell>
                    <TableCell>{resident.total}</TableCell>
                    <TableCell>
                      {resident.upcoming > 0 ? (
                        <Badge variant="secondary">{resident.upcoming}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {resident.nextDate ? formatDateLabel(resident.nextDate) : "—"}
                    </TableCell>
                    <TableCell>
                      {resident.lastDate ? formatDateLabel(resident.lastDate) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to="/bookings" className="text-sm text-primary hover:underline">
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
