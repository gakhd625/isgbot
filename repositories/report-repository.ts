import type { AppointmentStatus } from "@/types/database";
import type { CheckerProductivity, DashboardStats, ReportFilters } from "@/types/reports";
import type { ServerSupabaseClient } from "@/lib/supabase/server";
import { toAppError } from "@/lib/supabase/errors";

const statuses: AppointmentStatus[] = ["Pending", "Confirmed", "Done", "Reschedule", "No Show", "Cancelled"];

export class ReportRepository {
  constructor(private readonly db: ServerSupabaseClient) {}

  async dashboardStats(): Promise<DashboardStats> {
    const { data, error } = await this.db.from("appointments").select("status");
    if (error) throw toAppError(error, "Load dashboard stats failed");

    const stats = Object.fromEntries(statuses.map((status) => [status, 0])) as DashboardStats;
    stats["Total Appointments"] = data.length;
    data.forEach((row) => {
      stats[row.status] += 1;
    });
    return stats;
  }

  async statusSummary(filters: ReportFilters = {}) {
    let query = this.db.from("appointments").select("status, appointment_date, checked_by");
    if (filters.startDate) query = query.gte("appointment_date", filters.startDate);
    if (filters.endDate) query = query.lte("appointment_date", filters.endDate);
    if (filters.status && filters.status !== "All") query = query.eq("status", filters.status);
    if (filters.checker) query = query.eq("checked_by", filters.checker);

    const { data, error } = await query;
    if (error) throw toAppError(error, "Load status summary failed");

    return statuses.map((status) => ({
      status,
      count: data.filter((row) => row.status === status).length
    }));
  }

  async checkerProductivity(filters: ReportFilters = {}): Promise<CheckerProductivity[]> {
    let query = this.db.from("activity_logs").select("checked_by, created_at");
    if (filters.startDate) query = query.gte("created_at", `${filters.startDate}T00:00:00Z`);
    if (filters.endDate) query = query.lte("created_at", `${filters.endDate}T23:59:59Z`);
    if (filters.checker) query = query.eq("checked_by", filters.checker);

    const { data, error } = await query;
    if (error) throw toAppError(error, "Load checker productivity failed");

    const grouped = data.reduce<Record<string, number>>((acc, row) => {
      acc[row.checked_by] = (acc[row.checked_by] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([checked_by, updates]) => ({ checked_by, updates }))
      .sort((a, b) => b.updates - a.updates);
  }
}
