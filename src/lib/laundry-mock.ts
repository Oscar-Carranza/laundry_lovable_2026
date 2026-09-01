import demo from "@/data/laundry-demo.json";
import type { Booking, Slot } from "./laundry.functions";

const { slotStartHour, slotEndHour, slotDurationHours } = demo;

const isoFromOffset = (offset: number) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const slotHours = () => {
  const hours: number[] = [];
  for (let h = slotStartHour; h < slotEndHour; h += slotDurationHours) hours.push(h);
  return hours;
};

export const slotLabel = (start: number) =>
  `${`${start}`.padStart(2, "0")}:00-${`${start + slotDurationHours}`.padStart(2, "0")}:00`;

type Store = { bookings: Booking[]; nextId: number };

let store: Store | null = null;

const getStore = (): Store => {
  if (!store) {
    const bookings = demo.bookings.map((b) => ({
      id: b.id,
      user: b.user,
      date: isoFromOffset(b.dayOffset),
      slot_start: b.slot_start,
    }));
    store = { bookings, nextId: Math.max(...bookings.map((b) => b.id)) + 1 };
  }
  return store;
};

const delay = <T>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), 180));

export const mockListSlots = (date: string): Promise<Slot[]> => {
  const taken = new Map(
    getStore()
      .bookings.filter((b) => b.date === date)
      .map((b) => [b.slot_start, b.user] as const),
  );
  return delay(
    slotHours().map((hour) => ({
      date,
      slot_start: hour,
      slot_end: hour + slotDurationHours,
      label: slotLabel(hour),
      available: !taken.has(hour),
      booked_by: taken.get(hour) ?? null,
    })),
  );
};

export const mockListBookings = (user?: string): Promise<Booking[]> => {
  const all = getStore().bookings;
  return delay(user ? all.filter((b) => b.user.toLowerCase() === user.toLowerCase()) : [...all]);
};

const assertSlot = (slotStart: number) => {
  if (!slotHours().includes(slotStart)) {
    throw new Error(
      `Invalid slot ${slotStart}:00. Valid slots are: ${slotHours().map(slotLabel).join(", ")}.`,
    );
  }
};

export const mockCreateBooking = async (input: {
  user: string;
  date: string;
  slot_start: number;
}): Promise<Booking> => {
  assertSlot(input.slot_start);
  const s = getStore();
  if (s.bookings.some((b) => b.date === input.date && b.slot_start === input.slot_start)) {
    throw new Error(`Slot ${slotLabel(input.slot_start)} on ${input.date} is already booked.`);
  }
  const booking: Booking = { id: s.nextId++, ...input };
  s.bookings.push(booking);
  return delay(booking);
};

export const mockRescheduleBooking = async (input: {
  id: number;
  date: string;
  slot_start: number;
}): Promise<Booking> => {
  assertSlot(input.slot_start);
  const s = getStore();
  const booking = s.bookings.find((b) => b.id === input.id);
  if (!booking) throw new Error(`Booking ${input.id} not found.`);
  if (
    s.bookings.some(
      (b) => b.id !== input.id && b.date === input.date && b.slot_start === input.slot_start,
    )
  ) {
    throw new Error(`Slot ${slotLabel(input.slot_start)} on ${input.date} is already booked.`);
  }
  booking.date = input.date;
  booking.slot_start = input.slot_start;
  return delay({ ...booking });
};

export const mockCancelBooking = async (id: number) => {
  const s = getStore();
  const index = s.bookings.findIndex((b) => b.id === id);
  if (index === -1) throw new Error(`Booking ${id} not found.`);
  s.bookings.splice(index, 1);
  return delay({ id });
};

/** Very small scripted assistant that actually manipulates the demo data. */
export const mockChat = async ({ user, message }: { user: string; message: string }) => {
  const text = message.toLowerCase();
  const today = isoFromOffset(0);
  const tomorrow = isoFromOffset(1);
  const date = text.includes("tomorrow") ? tomorrow : today;

  const hourMatch = text.match(/\b(\d{1,2})\b/);
  const hour = hourMatch ? Number(hourMatch[1]) : null;

  try {
    if (text.includes("cancel")) {
      const mine = getStore()
        .bookings.filter((b) => b.user.toLowerCase() === user.toLowerCase() && b.date >= today)
        .sort((a, b) => (a.date === b.date ? a.slot_start - b.slot_start : a.date.localeCompare(b.date)));
      const target = mine[0];
      if (!target) return delay({ reply: `You have no upcoming bookings to cancel, ${user}.` });
      await mockCancelBooking(target.id);
      return delay({
        reply: `Done — I cancelled your ${slotLabel(target.slot_start)} slot on ${target.date}.`,
      });
    }

    if (text.includes("book") || text.includes("reserve") || text.includes("wash")) {
      const slots = await mockListSlots(date);
      const chosen =
        (hour !== null ? slots.find((s) => s.slot_start === hour && s.available) : undefined) ??
        slots.find((s) => s.available);
      if (!chosen) return delay({ reply: `Sorry, ${date} is fully booked. Try another day.` });
      await mockCreateBooking({ user, date, slot_start: chosen.slot_start });
      return delay({ reply: `Booked ${chosen.label} on ${date} for ${user}. See you there!` });
    }

    if (text.includes("free") || text.includes("available") || text.includes("slot")) {
      const slots = await mockListSlots(date);
      const free = slots.filter((s) => s.available).map((s) => s.label);
      return delay({
        reply: free.length
          ? `Free slots on ${date}: ${free.join(", ")}.`
          : `Nothing free on ${date}, sorry.`,
      });
    }

    return delay({
      reply:
        "I can book, reschedule or cancel laundry slots. Try \"book me tomorrow at 10\", \"what's free today\" or \"cancel my booking\".",
    });
  } catch (error) {
    return delay({ reply: (error as Error).message });
  }
};
