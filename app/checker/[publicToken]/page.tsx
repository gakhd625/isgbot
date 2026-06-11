import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckerForm } from "@/features/checker/checker-form";
import { createClient } from "@/lib/supabase/server";
import { AppointmentRepository } from "@/repositories/appointment-repository";
import { CheckerRepository } from "@/repositories/checker-repository";

export default async function CheckerPage({ params }: { params: Promise<{ publicToken: string }> }) {
  const { publicToken } = await params;
  const supabase = await createClient();
  const [appointment, checkers] = await Promise.all([
    new AppointmentRepository(supabase).findCheckerByToken(publicToken),
    new CheckerRepository(supabase).active()
  ]);

  if (!appointment) notFound();

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-lg space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Appointment Check</h1>
          <p className="text-sm text-muted-foreground">Update status and remarks only.</p>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <CardTitle>{appointment.client_name}</CardTitle>
              <Badge>{appointment.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{appointment.phone_number}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Area</p>
              <p className="font-medium">{appointment.area}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">{appointment.appointment_date}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Time</p>
                <p className="font-medium">{appointment.appointment_time.slice(0, 5)}</p>
              </div>
            </div>
            {appointment.remarks ? (
              <div>
                <p className="text-muted-foreground">Current Remarks</p>
                <p>{appointment.remarks}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status Update</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckerForm appointmentId={appointment.id} publicToken={publicToken} checkers={checkers} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
