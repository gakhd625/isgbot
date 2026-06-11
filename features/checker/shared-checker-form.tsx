"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { updateSharedCheckerAppointmentAction } from "@/actions/checker-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { appointmentStatuses } from "@/lib/validation";
import type { AppointmentStatus, Checker } from "@/types/database";

export function SharedCheckerForm({
  appointmentId,
  currentStatus,
  checkers
}: {
  appointmentId: string;
  currentStatus: AppointmentStatus;
  checkers: Checker[];
}) {
  const [state, action, pending] = useActionState(updateSharedCheckerAppointmentAction, {});

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="appointment_id" value={appointmentId} />
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`checked_by_${appointmentId}`}>Checker</Label>
          <Select id={`checked_by_${appointmentId}`} name="checked_by" required defaultValue="">
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
        <div className="space-y-1.5">
          <Label htmlFor={`status_${appointmentId}`}>Status</Label>
          <Select id={`status_${appointmentId}`} name="status" required defaultValue={currentStatus}>
            {appointmentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`remarks_${appointmentId}`}>Remarks</Label>
        <Textarea id={`remarks_${appointmentId}`} name="remarks" className="min-h-20" />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-primary">Updated.</p> : null}
      <Button className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Save Update
      </Button>
    </form>
  );
}
