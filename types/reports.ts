import type { AppointmentStatus } from "@/types/database";

export type DashboardStats = Record<AppointmentStatus | "Total Appointments", number>;

export type ReportFilters = {
  startDate?: string;
  endDate?: string;
  status?: AppointmentStatus | "All";
  checker?: string;
};

export type CheckerProductivity = {
  checked_by: string;
  updates: number;
};
