import * as React from "react";
import { cn } from "@/lib/utils";

const tone: Record<string, string> = {
  Pending: "bg-muted text-muted-foreground",
  Confirmed: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  Done: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  Reschedule: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  "No Show": "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
  Cancelled: "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
};

export function Badge({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-1 text-xs font-medium",
        typeof children === "string" ? tone[children] : "bg-muted text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
