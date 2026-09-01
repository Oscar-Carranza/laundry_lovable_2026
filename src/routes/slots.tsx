import { useQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { ErrorState, LoadingState } from "@/components/ApiState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addDays, formatDateLabel, slotsQuery, todayIso } from "@/lib/laundry-queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/slots")({
  head: () => ({
    meta: [
      { title: "Slot Schedule — Laundry Butler" },
      {
        name: "description",
        content:
          "Week-at-a-glance availability for the laundry room's fixed two-hour slots between 08:00 and 22:00.",
      },
      { property: "og:title", content: "Slot Schedule — Laundry Butler" },
      {
        property: "og:description",
        content: "See a full week of laundry slot availability at a glance.",
      },
    ],
  }),
  component: SlotsPage,
});

function SlotsPage() {
  const [start, setStart] = useState(todayIso());
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  const results = useQueries({ queries: days.map((day) => slotsQuery(day)) });
  const error = results.find((r) => r.error)?.error;
  const isPending = results.some((r) => r.isPending);
  const slotHours = results.find((r) => r.data)?.data?.map((s) => s.slot_start) ?? [];

  return (
    <AppShell
      title="Slot schedule"
      description="Fixed two-hour blocks from 08:00 to 22:00, one laundry room."
    >
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-base">
            {formatDateLabel(days[0]!)} – {formatDateLabel(days[6]!)}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setStart(addDays(start, -7))}>
              Previous week
            </Button>
            <Button variant="outline" size="sm" onClick={() => setStart(todayIso())}>
              This week
            </Button>
            <Button variant="outline" size="sm" onClick={() => setStart(addDays(start, 7))}>
              Next week
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <ErrorState error={error} />
          ) : isPending ? (
            <LoadingState label="Loading week…" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-separate border-spacing-1 text-sm">
                <thead>
                  <tr>
                    <th className="w-28 text-left font-medium text-muted-foreground">Slot</th>
                    {days.map((day) => (
                      <th key={day} className="text-center font-medium text-muted-foreground">
                        {formatDateLabel(day)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slotHours.map((hour, rowIndex) => (
                    <tr key={hour}>
                      <td className="font-medium">
                        {results[0]?.data?.[rowIndex]?.label ?? `${hour}:00`}
                      </td>
                      {days.map((day, colIndex) => {
                        const slot = results[colIndex]?.data?.[rowIndex];
                        return (
                          <td key={day} className="text-center">
                            <div
                              title={slot?.booked_by ?? "Free"}
                              className={cn(
                                "truncate rounded-md px-2 py-2 text-xs",
                                slot?.available
                                  ? "bg-accent/20 text-accent-foreground"
                                  : "bg-primary/15 font-medium text-foreground",
                              )}
                            >
                              {slot?.available ? "Free" : (slot?.booked_by ?? "—")}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
