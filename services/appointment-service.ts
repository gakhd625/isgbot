import type { User } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { absoluteUrl } from "@/lib/utils";
import {
  createAppointmentSchema,
  checkerUpdateSchema,
  sharedCheckerUpdateSchema,
  updateAppointmentSchema
} from "@/lib/validation";
import { AppointmentRepository } from "@/repositories/appointment-repository";
import { AppSettingRepository } from "@/repositories/app-setting-repository";
import { TelegramService } from "@/services/telegram-service";
import { TelegramBoardService } from "@/services/telegram-board-service";

export class AppointmentService {
  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly settings?: AppSettingRepository,
    private readonly telegram = new TelegramService()
  ) {}

  private async refreshTelegramBoard() {
    if (!this.settings) return null;
    await new TelegramBoardService(this.appointments, this.settings, this.telegram).refreshBoard();
    return null;
  }

  async create(formData: FormData, user: User) {
    const parsed = createAppointmentSchema.parse(Object.fromEntries(formData));
    const setterName = user.user_metadata?.full_name || user.email || "Setter";
    const appointment = await this.appointments.create({
      ...parsed,
      setter_id: user.id,
      setter_name: setterName
    });

    let telegramWarning: string | undefined;
    try {
      await this.refreshTelegramBoard();
    } catch (error) {
      telegramWarning = error instanceof Error ? error.message : "Telegram board refresh failed.";
      console.error(error);
    }

    revalidatePath("/dashboard");
    revalidatePath("/appointments");
    return { appointment, checkerUrl: absoluteUrl("/checker"), telegramWarning };
  }

  async update(formData: FormData) {
    const parsed = updateAppointmentSchema.parse(Object.fromEntries(formData));
    const { id, ...input } = parsed;
    const appointment = await this.appointments.updateOwned(id, input);
    try {
      await this.refreshTelegramBoard();
    } catch (error) {
      console.error(error);
    }
    revalidatePath("/dashboard");
    revalidatePath("/appointments");
    return appointment;
  }

  async updateFromChecker(formData: FormData) {
    const parsed = checkerUpdateSchema.parse(Object.fromEntries(formData));
    const updated = await this.appointments.updateFromChecker(parsed);
    if (!updated) throw new Error("Appointment not found");

    await this.refreshTelegramBoard();

    revalidatePath("/dashboard");
    revalidatePath(`/checker/${parsed.public_token}`);
    revalidatePath("/checker");
    return updated;
  }

  async updateFromSharedChecker(formData: FormData) {
    const parsed = sharedCheckerUpdateSchema.parse(Object.fromEntries(formData));
    const updated = await this.appointments.updateSharedChecker(parsed);
    if (!updated) throw new Error("Appointment not found");

    await this.refreshTelegramBoard();

    revalidatePath("/dashboard");
    revalidatePath("/checker");
    return updated;
  }
}
