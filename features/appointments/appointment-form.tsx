"use client";

import { useActionState, useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { createAppointmentAction, updateAppointmentAction } from "@/actions/appointment-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Appointment, Area } from "@/types/database";

export function AppointmentForm({ appointment, areas }: { appointment?: Appointment; areas: Area[] }) {
  const [selectedAreaName, setSelectedAreaName] = useState(appointment?.area ?? "");
  const [state, action, pending] = useActionState(
    appointment ? updateAppointmentAction : createAppointmentAction,
    {}
  );
  const selectedArea = useMemo(
    () => areas.find((area) => area.name === selectedAreaName),
    [areas, selectedAreaName]
  );
  const fixedTime = selectedArea?.default_appointment_time?.slice(0, 5) ?? appointment?.appointment_time?.slice(0, 5) ?? "";
  const timeSlotLabel = selectedArea?.time_slot_label ?? fixedTime;
  const scheduleNote = selectedArea?.schedule_note ?? "Select an area to load the fixed time slot.";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{appointment ? "Edit Appointment" : "Create Appointment"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4 sm:grid-cols-2">
          {appointment ? <input type="hidden" name="id" value={appointment.id} /> : null}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="client_name">Client Name</Label>
            <Input id="client_name" name="client_name" defaultValue={appointment?.client_name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input id="phone_number" name="phone_number" defaultValue={appointment?.phone_number} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="area">Area</Label>
            <Select
              id="area"
              name="area"
              value={selectedAreaName}
              onChange={(event) => setSelectedAreaName(event.target.value)}
              required
            >
              <option value="" disabled>
                Select area
              </option>
              {appointment?.area && !areas.some((area) => area.name === appointment.area) ? (
                <option value={appointment.area}>{appointment.area}</option>
              ) : null}
              {areas.map((area) => (
                <option key={area.id} value={area.name}>
                  {area.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="appointment_date">Appointment Date</Label>
            <Input
              id="appointment_date"
              name="appointment_date"
              type="date"
              defaultValue={appointment?.appointment_date}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="appointment_time_display">Time Slot</Label>
            <Input id="appointment_time_display" value={timeSlotLabel} readOnly />
            <input type="hidden" name="appointment_time" value={fixedTime} />
            <p className="text-xs text-muted-foreground">{scheduleNote}</p>
          </div>
          {state.error ? <p className="text-sm text-destructive sm:col-span-2">{state.error}</p> : null}
          {state.telegramWarning ? (
            <p className="text-sm text-destructive sm:col-span-2">
              Appointment saved, but Telegram did not update: {state.telegramWarning}
            </p>
          ) : null}
          {state.checkerUrl ? (
            <div className="rounded-md border bg-muted p-3 text-sm sm:col-span-2">
              <p className="font-medium">Checker URL</p>
              <div className="mt-2 flex items-center gap-2">
                <Input value={state.checkerUrl} readOnly />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label="Copy checker URL"
                  onClick={() => navigator.clipboard.writeText(state.checkerUrl!)}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
          ) : null}
          {state.ok && !state.checkerUrl ? (
            <p className="text-sm text-primary sm:col-span-2">Appointment saved.</p>
          ) : null}
          <Button className="sm:col-span-2" disabled={pending}>
            {appointment ? "Save Changes" : "Create Appointment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
