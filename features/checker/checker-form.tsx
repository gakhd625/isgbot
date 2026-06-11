"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { updateCheckerAppointmentAction } from "@/actions/checker-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { appointmentStatuses } from "@/lib/validation";
import { useRealtimeChecker } from "@/hooks/use-realtime-checker";
import type { Checker } from "@/types/database";

export function CheckerForm({
  appointmentId,
  publicToken,
  checkers
}: {
  appointmentId: string;
  publicToken: string;
  checkers: Checker[];
}) {
  const [state, action, pending] = useActionState(updateCheckerAppointmentAction, {});
  const realtime = useRealtimeChecker(appointmentId);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="public_token" value={publicToken} />
      <div className="space-y-2">
        <Label htmlFor="checked_by">Checker Name</Label>
        <Select id="checked_by" name="checked_by" required defaultValue="">
          <option value="" disabled>
            Select checker
          </option>
          {checkers.map((checker) => (
            <option key={checker.id} value={checker.name}>
              {checker.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select id="status" name="status" required defaultValue="Pending">
          {appointmentStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea id="remarks" name="remarks" placeholder="Add call result or next step" />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-primary">Status updated.</p> : null}
      <Button className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Submit Update
      </Button>
      {realtime.isPending ? <p className="text-xs text-muted-foreground">Refreshing latest status...</p> : null}
    </form>
  );
}
