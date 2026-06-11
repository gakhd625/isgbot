"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function useRealtimeDashboard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => {
        setLastUpdate(new Date());
        startTransition(() => router.refresh());
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_logs" }, () => {
        setLastUpdate(new Date());
        startTransition(() => router.refresh());
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return { isPending, lastUpdate };
}
