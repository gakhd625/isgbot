import type { ServerSupabaseClient } from "@/lib/supabase/server";
import { toAppError } from "@/lib/supabase/errors";

export class ActivityLogRepository {
  constructor(private readonly db: ServerSupabaseClient) {}

  async recent(limit = 25) {
    const { data, error } = await this.db
      .from("activity_logs")
      .select("*, appointments(client_name, phone_number)")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw toAppError(error, "Load recent activity failed");
    return data;
  }

  async forAppointment(appointmentId: string) {
    const { data, error } = await this.db
      .from("activity_logs")
      .select("*")
      .eq("appointment_id", appointmentId)
      .order("created_at", { ascending: false });
    if (error) throw toAppError(error, "Load appointment activity failed");
    return data;
  }
}
