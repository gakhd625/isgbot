import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityFeed } from "@/features/dashboard/activity-feed";
import { RealtimeStatus } from "@/features/dashboard/realtime-status";
import { StatGrid } from "@/features/dashboard/stat-grid";
import { AppointmentList } from "@/features/appointments/appointment-list";
import { createClient } from "@/lib/supabase/server";
import { ActivityLogRepository } from "@/repositories/activity-log-repository";
import { AppointmentRepository } from "@/repositories/appointment-repository";
import { ReportRepository } from "@/repositories/report-repository";

export default async function DashboardPage() {
  const supabase = await createClient();
  const stats = await new ReportRepository(supabase).dashboardStats();
  const appointments = await new AppointmentRepository(supabase).list();
  const activities = await new ActivityLogRepository(supabase).recent(8);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <RealtimeStatus />
        </div>
        <Button asChild>
          <Link href="/appointments/new">
            <Plus className="size-4" />
            New
          </Link>
        </Button>
      </div>
      <StatGrid stats={stats} />
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <h2 className="text-base font-semibold">Appointment History</h2>
          <AppointmentList appointments={appointments.slice(0, 12)} />
        </div>
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
}
