import { AppointmentForm } from "@/features/appointments/appointment-form";
import { createClient } from "@/lib/supabase/server";
import { AreaRepository } from "@/repositories/area-repository";

export default async function NewAppointmentPage() {
  const supabase = await createClient();
  const areas = await new AreaRepository(supabase).active();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">New Appointment</h1>
      <AppointmentForm areas={areas} />
    </div>
  );
}
