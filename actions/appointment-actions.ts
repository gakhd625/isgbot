"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppointmentRepository } from "@/repositories/appointment-repository";
import { AppSettingRepository } from "@/repositories/app-setting-repository";
import { AppointmentService } from "@/services/appointment-service";
import { TelegramBoardService } from "@/services/telegram-board-service";

export type ActionState = {
  ok?: boolean;
  error?: string;
  checkerUrl?: string;
  telegramWarning?: string;
};

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  return { supabase, user };
}

export async function createAppointmentAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase, user } = await requireUser();
    const service = new AppointmentService(new AppointmentRepository(supabase), new AppSettingRepository(supabase));
    const result = await service.create(formData, user);
    return { ok: true, checkerUrl: result.checkerUrl, telegramWarning: result.telegramWarning };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to create appointment." };
  }
}

export async function updateAppointmentAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireUser();
    const service = new AppointmentService(new AppointmentRepository(supabase), new AppSettingRepository(supabase));
    await service.update(formData);
    return { ok: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to update appointment." };
  }
}

export async function refreshTelegramBoardAction(): Promise<void> {
  const { supabase } = await requireUser();
  await new TelegramBoardService(
    new AppointmentRepository(supabase),
    new AppSettingRepository(supabase)
  ).refreshBoard();
}
