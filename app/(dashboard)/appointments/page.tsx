import { AppointmentFilters } from "@/features/filters/appointment-filters";
import { AppointmentList } from "@/features/appointments/appointment-list";
import { RefreshTelegramButton } from "@/features/appointments/refresh-telegram-button";
import { createClient } from "@/lib/supabase/server";
import { AppointmentRepository } from "@/repositories/appointment-repository";
import type { AppointmentStatus } from "@/types/database";

export default async function AppointmentsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string; date?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const appointments = await new AppointmentRepository(supabase).list({
    query: params.q,
    status: (params.status as AppointmentStatus | "All" | undefined) ?? "All",
    date: params.date || undefined
  });

  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Appointments</h1>
            <p className="text-sm text-muted-foreground">Search, filter, and edit records you created.</p>
          </div>
          <RefreshTelegramButton />
        </div>
      </div>
      <AppointmentFilters query={params.q} status={params.status} date={params.date} />
      <AppointmentList appointments={appointments} />
    </div>
  );
}
