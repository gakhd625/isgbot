"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { refreshTelegramBoardAction } from "@/actions/appointment-actions";
import { Button } from "@/components/ui/button";

export function RefreshTelegramButton() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-1">
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              await refreshTelegramBoardAction();
              setMessage("Telegram board refreshed.");
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "Telegram refresh failed.");
            }
          })
        }
      >
        <Send className="size-4" />
        Telegram
      </Button>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
