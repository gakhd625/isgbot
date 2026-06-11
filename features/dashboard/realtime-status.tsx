"use client";

import { Loader2 } from "lucide-react";
import { useRealtimeDashboard } from "@/hooks/use-realtime-dashboard";

export function RealtimeStatus() {
  const { isPending, lastUpdate } = useRealtimeDashboard();
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {isPending ? <Loader2 className="size-3 animate-spin" /> : <span className="size-2 rounded-full bg-primary" />}
      <span>{lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString()}` : "Realtime connected"}</span>
    </div>
  );
}
