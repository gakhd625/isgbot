import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reportFilterSchema } from "@/lib/validation";
import { AppointmentRepository } from "@/repositories/appointment-repository";
import { appointmentsToCsv } from "@/services/csv-service";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const filters = reportFilterSchema.parse({
    startDate: url.searchParams.get("startDate") ?? "",
    endDate: url.searchParams.get("endDate") ?? "",
    status: url.searchParams.get("status") ?? "All",
    checker: url.searchParams.get("checker") ?? ""
  });

  const repo = new AppointmentRepository(supabase);
  const rows = await repo.list({
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    status: filters.status || "All",
    checker: filters.checker || undefined
  });

  const csv = appointmentsToCsv(rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="appointments-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
}
