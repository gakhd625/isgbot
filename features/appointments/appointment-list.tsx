import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { absoluteUrl } from "@/lib/utils";
import type { Appointment } from "@/types/database";

export function AppointmentList({ appointments }: { appointments: Appointment[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Checker</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">{appointment.client_name}</TableCell>
                  <TableCell>{appointment.phone_number}</TableCell>
                  <TableCell>{appointment.area}</TableCell>
                  <TableCell>
                    {appointment.appointment_date} {appointment.appointment_time.slice(0, 5)}
                  </TableCell>
                  <TableCell>
                    <Badge>{appointment.status}</Badge>
                  </TableCell>
                  <TableCell>{appointment.checked_by ?? "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button asChild size="icon" variant="ghost" aria-label="Edit">
                        <Link href={`/appointments/${appointment.id}/edit`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Button asChild size="icon" variant="ghost" aria-label="Open checker board">
                        <a href={absoluteUrl("/checker")} target="_blank" rel="noreferrer">
                          <ExternalLink className="size-4" />
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="divide-y md:hidden">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{appointment.client_name}</p>
                  <p className="text-sm text-muted-foreground">{appointment.phone_number}</p>
                  <p className="text-sm text-muted-foreground">{appointment.area}</p>
                </div>
                <Badge>{appointment.status}</Badge>
              </div>
              <p className="text-sm">
                {appointment.appointment_date} at {appointment.appointment_time.slice(0, 5)}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline">
                  <Link href={`/appointments/${appointment.id}/edit`}>Edit</Link>
                </Button>
                <Button asChild variant="secondary">
                  <a href={absoluteUrl("/checker")} target="_blank" rel="noreferrer">
                    Checker
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
        {appointments.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">No appointments found.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
