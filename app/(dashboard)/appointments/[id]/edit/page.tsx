import { notFound } from "next/navigation";
import { AppointmentForm } from "@/features/appointments/appointment-form";
import { createClient } from "@/lib/supabase/server";
import { AreaRepository } from "@/repositories/area-repository";
import { AppointmentRepository } from "@/repositories/appointment-repository";

export default async function EditAppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  try {
    const [appointment, areas] = await Promise.all([
      new AppointmentRepository(supabase).findOwnedById(id),
      new AreaRepository(supabase).active()
    ]);
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold">Edit Appointment</h1>
        <AppointmentForm appointment={appointment} areas={areas} />
      </div>
    );
  } catch {
    notFound();
  }
}
