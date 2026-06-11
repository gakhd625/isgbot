import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/types/reports";

const labels = ["Total Appointments", "Pending", "Confirmed", "Done", "Reschedule", "No Show", "Cancelled"] as const;

export function StatGrid({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-7">
      {labels.map((label) => (
        <Card key={label}>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs text-muted-foreground">{label}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-semibold">{stats[label] ?? 0}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
