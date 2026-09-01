import { queryOptions } from "@tanstack/react-query";

// DEMO MODE: data comes from src/data/laundry-demo.json via the in-memory mock
// store. To use the real API, swap these calls back to ./laundry.functions.
import { mockListBookings, mockListSlots } from "./laundry-mock";
import type { Booking } from "./laundry.functions";


export const toIsoDate = (date: Date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const todayIso = () => toIsoDate(new Date());

export const addDays = (iso: string, days: number) => {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y!, (m ?? 1) - 1, d! + days);
  return toIsoDate(date);
};

export const formatSlot = (slotStart: number) =>
  `${`${slotStart}`.padStart(2, "0")}:00–${`${slotStart + 2}`.padStart(2, "0")}:00`;

export const formatDateLabel = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d!).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

export const slotsQuery = (date: string) =>
  queryOptions({
    queryKey: ["slots", date],
    queryFn: () => mockListSlots(date),
  });

export const bookingsQuery = (user?: string) =>
  queryOptions({
    queryKey: ["bookings", user ?? "all"],
    queryFn: () => mockListBookings(user),
  });

export const healthQuery = queryOptions({
  queryKey: ["health"],
  queryFn: async () => ({ ok: true as const, status: "Demo data" }),
});


export type Resident = {
  name: string;
  total: number;
  upcoming: number;
  nextDate: string | null;
  lastDate: string | null;
};

export const buildResidents = (bookings: Booking[]): Resident[] => {
  const today = todayIso();
  const map = new Map<string, Booking[]>();
  for (const booking of bookings) {
    const list = map.get(booking.user) ?? [];
    list.push(booking);
    map.set(booking.user, list);
  }
  return [...map.entries()]
    .map(([name, list]) => {
      const sorted = [...list].sort((a, b) =>
        a.date === b.date ? a.slot_start - b.slot_start : a.date.localeCompare(b.date),
      );
      const upcoming = sorted.filter((b) => b.date >= today);
      return {
        name,
        total: sorted.length,
        upcoming: upcoming.length,
        nextDate: upcoming[0]?.date ?? null,
        lastDate: sorted[sorted.length - 1]?.date ?? null,
      };
    })
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
};
