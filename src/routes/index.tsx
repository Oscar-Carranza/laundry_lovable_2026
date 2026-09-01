import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  WashingMachine,
} from "lucide-react";

import heroImage from "@/assets/laundry-hero.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Laundry Butler — Shared Laundry Bookings Made Simple" },
      {
        name: "description",
        content:
          "Laundry Butler turns the building notice board into a clean booking system: two-hour slots, zero double bookings, and a chat assistant that books for you.",
      },
      { property: "og:title", content: "Laundry Butler — Shared Laundry Bookings Made Simple" },
      {
        property: "og:description",
        content:
          "Two-hour laundry slots, zero double bookings, and a chat assistant that books for residents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

const features = [
  {
    icon: CalendarDays,
    title: "Two-hour slots, all day",
    body: "The laundry room runs on fixed 08:00–22:00 blocks, so everyone knows exactly what they get.",
  },
  {
    icon: ShieldCheck,
    title: "No double bookings",
    body: "A slot can only be claimed once. No more crossed-out names on a paper sheet in the hallway.",
  },
  {
    icon: MessageSquare,
    title: "Book by chat",
    body: "Residents can just say \"book me tomorrow at 10\" and the assistant handles the rest.",
  },
];

const steps = [
  { n: "01", title: "Pick a day", body: "Browse the week and see what's still open." },
  { n: "02", title: "Grab a free slot", body: "One tap books it under your name." },
  { n: "03", title: "Show up clean", body: "Reschedule or cancel any time from your bookings." },
];

function Welcome() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <WashingMachine className="size-5" />
          </span>
          <span className="text-sm font-semibold tracking-tight">Laundry Butler</span>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard">Open console</Link>
        </Button>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-8 md:grid-cols-2 md:pt-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-accent" />
              Demo data — explore freely
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
              Laundry bookings, sorted.
              <span className="block text-primary">No notice board, no double bookings.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground">
              Laundry Butler gives every resident a live view of the shared laundry room — who has
              which slot, what's still free this week, and a chat assistant that books it for them.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/dashboard">
                  Open the dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/assistant">Try the assistant</Link>
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border shadow-lg">
            <img
              src={heroImage}
              alt="Bright shared laundry room with rows of washing machines"
              width={1536}
              height={1024}
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        <section className="border-y border-border bg-card/40">
          <div className="mx-auto grid max-w-6xl gap-4 px-6 py-14 md:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="border-border/70">
                <CardContent className="pt-6">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                    <Icon className="size-5" />
                  </span>
                  <h2 className="mt-4 text-base font-semibold">{title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map(({ n, title, body }) => (
              <div key={n} className="rounded-xl border border-border bg-card p-5">
                <span className="text-xs font-semibold tracking-widest text-primary">{n}</span>
                <h3 className="mt-2 text-base font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-border bg-primary/5 p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Ready to see it in action?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The console is pre-loaded with a week of resident bookings.
              </p>
            </div>
            <Button asChild size="lg">
              <Link to="/dashboard">
                Open the dashboard
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted-foreground">
        Laundry Butler — shared laundry booking for residential buildings.
      </footer>
    </div>
  );
}
