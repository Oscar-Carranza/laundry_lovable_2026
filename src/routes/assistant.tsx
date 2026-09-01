import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockChat as sendChatMessage } from "@/lib/laundry-mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Booking Assistant — Laundry Butler" },
      {
        name: "description",
        content:
          "Chat with the Laundry Butler bot to create, reschedule or cancel laundry bookings in plain language.",
      },
      { property: "og:title", content: "Booking Assistant — Laundry Butler" },
      {
        property: "og:description",
        content: "Manage laundry bookings conversationally with the Laundry Butler bot.",
      },
    ],
  }),
  component: AssistantPage,
});

type Message = { role: "user" | "bot"; text: string };

function AssistantPage() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const send = useMutation({
    mutationFn: (message: string) => sendChatMessage({ user: user.trim(), message }),
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
      void queryClient.invalidateQueries({ queryKey: ["slots"] });
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const message = input.trim();
    if (!message) return;
    if (!user.trim()) {
      toast.error("Enter the resident's name first");
      return;
    }
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    send.mutate(message);
  };

  return (
    <AppShell
      title="Booking assistant"
      description="Ask the bot to book, move or cancel a laundry slot."
    >
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle className="text-base">Chat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="chat-user">Resident name</Label>
            <Input
              id="chat-user"
              placeholder="e.g. Oscar"
              value={user}
              onChange={(event) => setUser(event.target.value)}
              className="max-w-xs"
            />
          </div>

          <div className="flex min-h-72 flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4">
            {messages.length === 0 ? (
              <p className="m-auto text-sm text-muted-foreground">
                Try: "Book me tomorrow at 10" or "Cancel my booking on Friday".
              </p>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                    message.role === "user"
                      ? "self-end bg-primary text-primary-foreground"
                      : "self-start bg-card text-card-foreground border border-border",
                  )}
                >
                  {message.text}
                </div>
              ))
            )}
            {send.isPending ? (
              <div className="self-start rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
                Thinking…
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="Message the laundry butler…"
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <Button type="submit" disabled={send.isPending}>
              <Send className="size-4" />
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
