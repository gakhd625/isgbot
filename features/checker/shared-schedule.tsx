import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SharedCheckerForm } from "@/features/checker/shared-checker-form";
import type { AppointmentStatus, Checker } from "@/types/database";

type CheckerAppointment = {
  id: string;
  client_name: string;
  phone_number: string;
  area: string;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  remarks: string | null;
  checked_by: string | null;
  checked_at: string | null;
};

function groupAppointments(appointments: CheckerAppointment[]) {
  return appointments.reduce<Record<string, CheckerAppointment[]>>((groups, appointment) => {
    const key = `${appointment.area} | ${appointment.appointment_date}`;
    groups[key] = groups[key] ?? [];
    groups[key].push(appointment);
    return groups;
  }, {});
}

export function SharedSchedule({
  appointments,
  checkers
}: {
  appointments: CheckerAppointment[];
  checkers: Checker[];
}) {
  const groups = groupAppointments(appointments);

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([key, rows]) => {
        const [area, date] = key.split(" | ");
        return (
          <section key={key} className="space-y-2">
            <div className="flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2">
              <h2 className="text-base font-semibold">{area}</h2>
              <p className="text-sm text-muted-foreground">{format(new Date(`${date}T00:00:00`), "EEE, MMM d")}</p>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {rows.map((appointment) => (
                <Card key={appointment.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">{appointment.client_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{appointment.phone_number}</p>
                      </div>
                      <Badge>{appointment.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 rounded-md bg-muted p-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Schedule</p>
                        <p className="font-medium">{appointment.appointment_time.slice(0, 5)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Checker</p>
                        <p className="font-medium">{appointment.checked_by ?? "-"}</p>
                      </div>
                    </div>
                    {appointment.remarks ? <p className="text-sm">{appointment.remarks}</p> : null}
                    <SharedCheckerForm
                      appointmentId={appointment.id}
                      currentStatus={appointment.status}
                      checkers={checkers}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
      {appointments.length === 0 ? (
        <p className="rounded-md border bg-card p-6 text-center text-sm text-muted-foreground">
          No schedules available.
        </p>
      ) : null}
    </div>
  );
}
