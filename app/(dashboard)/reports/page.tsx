import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { appointmentStatuses } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";
import { CheckerRepository } from "@/repositories/checker-repository";
import { ReportRepository } from "@/repositories/report-repository";
import type { AppointmentStatus } from "@/types/database";

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string; status?: string; checker?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const repo = new ReportRepository(supabase);
  const filters = {
    startDate: params.startDate || undefined,
    endDate: params.endDate || undefined,
    status: (params.status as AppointmentStatus | "All" | undefined) ?? "All",
    checker: params.checker || undefined
  };
  const [summary, productivity, checkers] = await Promise.all([
    repo.statusSummary(filters),
    repo.checkerProductivity(filters),
    new CheckerRepository(supabase).active()
  ]);
  const exportParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) exportParams.set(key, value);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-sm text-muted-foreground">Daily, weekly, monthly, status, and checker summaries.</p>
        </div>
        <Button asChild>
          <a href={`/api/export?${exportParams.toString()}`}>
            <Download className="size-4" />
            CSV
          </a>
        </Button>
      </div>

      <form className="grid gap-2 sm:grid-cols-4">
        <Input name="startDate" type="date" defaultValue={params.startDate} />
        <Input name="endDate" type="date" defaultValue={params.endDate} />
        <Select name="status" defaultValue={params.status ?? "All"}>
          <option value="All">All statuses</option>
          {appointmentStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
        <Select name="checker" defaultValue={params.checker ?? ""}>
          <option value="">All checkers</option>
          {checkers.map((checker) => (
            <option key={checker.id} value={checker.name}>
              {checker.name}
            </option>
          ))}
        </Select>
        <Button className="sm:col-span-4">Apply Filters</Button>
      </form>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.map((row) => (
                  <TableRow key={row.status}>
                    <TableCell>{row.status}</TableCell>
                    <TableCell className="text-right">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Checker Productivity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Checker</TableHead>
                  <TableHead className="text-right">Updates</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productivity.map((row) => (
                  <TableRow key={row.checked_by}>
                    <TableCell>{row.checked_by}</TableCell>
                    <TableCell className="text-right">{row.updates}</TableCell>
                  </TableRow>
                ))}
                {productivity.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No updates in this range.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
