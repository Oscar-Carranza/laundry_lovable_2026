import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type Booking = {
  id: number;
  user: string;
  date: string;
  slot_start: number;
};

export type Slot = {
  date: string;
  slot_start: number;
  slot_end: number;
  label: string;
  available: boolean;
  booked_by: string | null;
};

type RequestOptions = {
  method?: string;
  path: string;
  body?: unknown;
};

async function callApi<T>({ method = "GET", path, body }: RequestOptions): Promise<T> {
  const baseUrl = process.env["LAUNDRY_API_BASE_URL"];
  if (!baseUrl) {
    throw new Error(
      "LAUNDRY_API_BASE_URL is not configured. Add it in project settings to connect the laundry API.",
    );
  }
  const apiKey = process.env["LAUNDRY_API_KEY"];
  const headerName = process.env["LAUNDRY_API_KEY_HEADER"] ?? "X-API-Key";

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers[headerName] = apiKey;

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  if (!res.ok) {
    let detail = `Request failed with status ${res.status}`;
    try {
      const payload = (await res.json()) as { detail?: unknown };
      if (typeof payload.detail === "string") detail = payload.detail;
    } catch {
      /* keep default message */
    }
    throw new Error(detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const getHealth = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const data = await callApi<{ status: string }>({ path: "/health" });
    return { ok: true as const, status: data.status };
  } catch (error) {
    return { ok: false as const, status: (error as Error).message };
  }
});

export const listSlots = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ date: z.string() }).parse(input))
  .handler(async ({ data }) => callApi<Slot[]>({ path: `/slots?date=${data.date}` }));

export const listBookings = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ user: z.string().optional() }).parse(input ?? {}))
  .handler(async ({ data }) => {
    const query = data.user ? `?user=${encodeURIComponent(data.user)}` : "";
    return callApi<Booking[]>({ path: `/bookings${query}` });
  });

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        user: z.string().min(1).max(100),
        date: z.string(),
        slot_start: z.number().int().min(0).max(23),
      })
      .parse(input),
  )
  .handler(async ({ data }) => callApi<Booking>({ method: "POST", path: "/bookings", body: data }));

export const rescheduleBooking = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        id: z.number().int(),
        date: z.string(),
        slot_start: z.number().int().min(0).max(23),
      })
      .parse(input),
  )
  .handler(async ({ data }) =>
    callApi<Booking>({
      method: "PATCH",
      path: `/bookings/${data.id}`,
      body: { date: data.date, slot_start: data.slot_start },
    }),
  );

export const cancelBooking = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ id: z.number().int() }).parse(input))
  .handler(async ({ data }) => {
    await callApi<void>({ method: "DELETE", path: `/bookings/${data.id}` });
    return { id: data.id };
  });

export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ user: z.string().min(1).max(100), message: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }) =>
    callApi<{ reply: string }>({ method: "POST", path: "/chat", body: data }),
  );
