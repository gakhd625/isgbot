import { ActivityFeed } from "@/features/dashboard/activity-feed";
import { createClient } from "@/lib/supabase/server";
import { ActivityLogRepository } from "@/repositories/activity-log-repository";

export default async function HistoryPage() {
  const supabase = await createClient();
  const activities = await new ActivityLogRepository(supabase).recent(100);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Appointment History</h1>
        <p className="text-sm text-muted-foreground">Every checker status update is preserved here.</p>
      </div>
      <ActivityFeed activities={activities} />
    </div>
  );
}
