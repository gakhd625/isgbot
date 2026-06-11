import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Activity = {
  id: string;
  checked_by: string;
  old_status: string;
  new_status: string;
  remark: string | null;
  created_at: string;
  appointments: { client_name: string; phone_number: string } | null;
};

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="border-l-2 border-primary pl-3">
            <p className="text-sm font-medium">{activity.appointments?.client_name ?? "Appointment"}</p>
            <p className="text-sm text-muted-foreground">
              {activity.checked_by}: {activity.old_status} to {activity.new_status}
            </p>
            {activity.remark ? <p className="mt-1 text-sm">{activity.remark}</p> : null}
            <p className="mt-1 text-xs text-muted-foreground">{format(new Date(activity.created_at), "PP p")}</p>
          </div>
        ))}
        {activities.length === 0 ? <p className="text-sm text-muted-foreground">No activity yet.</p> : null}
      </CardContent>
    </Card>
  );
}
