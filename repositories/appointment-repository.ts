import type { AppointmentStatus, Database } from "@/types/database";
import { sanitizeText } from "@/lib/utils";
import type { ServerSupabaseClient } from "@/lib/supabase/server";
import { toAppError } from "@/lib/supabase/errors";

export type AppointmentFilters = {
  query?: string;
  status?: AppointmentStatus | "All";
  date?: string;
  startDate?: string;
  endDate?: string;
  checker?: string;
};

export class AppointmentRepository {
  constructor(private readonly db: ServerSupabaseClient) {}

  async create(input: Database["public"]["Tables"]["appointments"]["Insert"]) {
    const { data, error } = await this.db.from("appointments").insert(input).select("*").single();
    if (error) throw toAppError(error, "Create appointment failed");
    return data;
  }

  async updateOwned(id: string, input: Database["public"]["Tables"]["appointments"]["Update"]) {
    const { data, error } = await this.db.from("appointments").update(input).eq("id", id).select("*").single();
    if (error) throw toAppError(error, "Update appointment failed");
    return data;
  }

  async updateTelegramMessage(
    id: string,
    input: Pick<Database["public"]["Tables"]["appointments"]["Update"], "telegram_chat_id" | "telegram_message_id">
  ) {
    const { data, error } = await this.db.from("appointments").update(input).eq("id", id).select("*").single();
    if (error) throw toAppError(error, "Save Telegram message reference failed");
    return data;
  }

  async findOwnedById(id: string) {
    const { data, error } = await this.db.from("appointments").select("*").eq("id", id).single();
    if (error) throw toAppError(error, "Load appointment failed");
    return data;
  }

  async findCheckerByToken(publicToken: string) {
    const { data, error } = await this.db.rpc("get_checker_appointment", { token: publicToken });
    if (error) throw toAppError(error, "Load checker appointment failed");
    return data.at(0) ?? null;
  }

  async listForSharedChecker() {
    const { data, error } = await this.db.rpc("list_checker_appointments");
    if (error) throw toAppError(error, "Load checker schedule failed");
    return data;
  }

  async findCheckerAppointmentByClientName(clientName: string) {
    const appointments = await this.listForSharedChecker();
    const target = sanitizeText(clientName).toLowerCase();
    return (
      appointments.find((appointment) => appointment.client_name.toLowerCase() === target) ??
      appointments.find((appointment) => appointment.client_name.toLowerCase().includes(target)) ??
      null
    );
  }

  async list(filters: AppointmentFilters = {}) {
    let query = this.db.from("appointments").select("*").order("appointment_date", { ascending: false });

    if (filters.query) {
      const safeQuery = sanitizeText(filters.query).replaceAll(",", "").replaceAll("%", "\\%");
      query = query.or(`client_name.ilike.%${safeQuery}%,phone_number.ilike.%${safeQuery}%`);
    }
    if (filters.status && filters.status !== "All") query = query.eq("status", filters.status);
    if (filters.date) query = query.eq("appointment_date", filters.date);
    if (filters.startDate) query = query.gte("appointment_date", filters.startDate);
    if (filters.endDate) query = query.lte("appointment_date", filters.endDate);
    if (filters.checker) query = query.eq("checked_by", filters.checker);

    const { data, error } = await query.limit(500);
    if (error) throw toAppError(error, "List appointments failed");
    return data;
  }

  async updateFromChecker(input: {
    public_token: string;
    checked_by: string;
    status: AppointmentStatus;
    remarks: string;
  }) {
    const { data, error } = await this.db.rpc("update_checker_appointment", {
      token: input.public_token,
      checker_name: input.checked_by,
      new_status: input.status,
      new_remark: input.remarks
    });
    if (error) throw toAppError(error, "Checker update failed");
    return data.at(0) ?? null;
  }

  async updateSharedChecker(input: {
    appointment_id: string;
    checked_by: string;
    status: AppointmentStatus;
    remarks: string;
  }) {
    const { data, error } = await this.db.rpc("update_checker_appointment_by_id", {
      appointment_uuid: input.appointment_id,
      checker_name: input.checked_by,
      new_status: input.status,
      new_remark: input.remarks
    });
    if (error) throw toAppError(error, "Checker update failed");
    return data.at(0) ?? null;
  }
}
