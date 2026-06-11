import { SharedSchedule } from "@/features/checker/shared-schedule";
import { createClient } from "@/lib/supabase/server";
import { AppointmentRepository } from "@/repositories/appointment-repository";
import { CheckerRepository } from "@/repositories/checker-repository";

export default async function SharedCheckerPage() {
  const supabase = await createClient();
  const [appointments, checkers] = await Promise.all([
    new AppointmentRepository(supabase).listForSharedChecker(),
    new CheckerRepository(supabase).active()
  ]);

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="space-y-1 rounded-md border bg-card p-4">
          <p className="text-sm font-medium text-primary">Island Gold</p>
          <h1 className="text-2xl font-semibold">Appointment Schedule</h1>
          <p className="text-sm text-muted-foreground">
            Shared checker board for status updates and remarks.
          </p>
        </header>
        <SharedSchedule appointments={appointments} checkers={checkers} />
      </div>
    </main>
  );
}
