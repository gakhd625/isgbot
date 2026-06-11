import { z } from "zod";
import { sanitizeText } from "@/lib/utils";

export const appointmentStatuses = ["Pending", "Confirmed", "Done", "Reschedule", "No Show", "Cancelled"] as const;

const clean = z.string().transform((value) => sanitizeText(value));

export const createAppointmentSchema = z.object({
  client_name: clean.pipe(z.string().min(1).max(160)),
  phone_number: clean.pipe(z.string().min(3).max(40)),
  area: clean.pipe(z.string().min(1).max(120)),
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  appointment_time: z.string().regex(/^\d{2}:\d{2}$/)
});

export const updateAppointmentSchema = createAppointmentSchema.extend({
  id: z.string().uuid()
});

export const checkerUpdateSchema = z.object({
  public_token: z.string().uuid(),
  checked_by: clean.pipe(z.string().min(1).max(120)),
  status: z.enum(appointmentStatuses),
  remarks: clean.pipe(z.string().max(2000)).optional().default("")
});

export const sharedCheckerUpdateSchema = z.object({
  appointment_id: z.string().uuid(),
  checked_by: clean.pipe(z.string().min(1).max(120)),
  status: z.enum(appointmentStatuses),
  remarks: clean.pipe(z.string().max(2000)).optional().default("")
});

export const reportFilterSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  status: z.enum(["All", ...appointmentStatuses]).optional(),
  checker: clean.optional()
});
