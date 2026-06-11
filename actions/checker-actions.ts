"use server";

import { createClient } from "@/lib/supabase/server";
import { AppointmentRepository } from "@/repositories/appointment-repository";
import { AppSettingRepository } from "@/repositories/app-setting-repository";
import { AppointmentService } from "@/services/appointment-service";

export type CheckerState = {
  ok?: boolean;
  error?: string;
};

export async function updateCheckerAppointmentAction(
  _state: CheckerState,
  formData: FormData
): Promise<CheckerState> {
  try {
    const supabase = await createClient();
    const service = new AppointmentService(new AppointmentRepository(supabase), new AppSettingRepository(supabase));
    await service.updateFromChecker(formData);
    return { ok: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to update appointment." };
  }
}

export async function updateSharedCheckerAppointmentAction(
  _state: CheckerState,
  formData: FormData
): Promise<CheckerState> {
  try {
    const supabase = await createClient();
    const service = new AppointmentService(new AppointmentRepository(supabase), new AppSettingRepository(supabase));
    await service.updateFromSharedChecker(formData);
    return { ok: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to update appointment." };
  }
}
