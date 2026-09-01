import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, LayoutDashboard, MessageSquare, Users, WashingMachine } from "lucide-react";
import type { ReactNode } from "react";

import { healthQuery } from "@/lib/laundry-queries";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/slots", label: "Slots", icon: WashingMachine },
  { to: "/residents", label: "Residents", icon: Users },
  { to: "/assistant", label: "Assistant", icon: MessageSquare },
] as const;

function HealthPill() {
  const { data, isPending } = useQuery(healthQuery);
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
      title="Running on bundled demo data"
    >
      <span className={cn("size-2 rounded-full", isPending ? "bg-muted-foreground" : "bg-accent")} />
      {isPending ? "Loading" : (data?.status ?? "Demo data")}
    </span>
  );
}


export function AppShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 md:flex">
        <Link to="/" className="flex items-center gap-2 px-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <WashingMachine className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground">Laundry Butler</p>
            <p className="text-xs text-muted-foreground">Booking console</p>
          </div>
        </Link>


        <nav className="mt-8 flex flex-col gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{
                className: "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
              }}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>

        <p className="mt-auto px-3 text-xs text-muted-foreground">
          Slots run 08:00–22:00 in two-hour blocks.
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/60 px-6 py-4 backdrop-blur">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <HealthPill />
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-card/40 px-4 py-2 md:hidden">
          {nav.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-muted-foreground"
              activeProps={{ className: "bg-primary text-primary-foreground" }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
