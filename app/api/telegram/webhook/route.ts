import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { serverEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { AppSettingRepository } from "@/repositories/app-setting-repository";
import { AppointmentRepository } from "@/repositories/appointment-repository";
import { CheckerRepository } from "@/repositories/checker-repository";
import { TelegramBoardService } from "@/services/telegram-board-service";
import { TelegramService, type TelegramCallbackUpdate } from "@/services/telegram-service";

export async function POST(request: Request) {
  const env = serverEnv();
  const secret = request.headers.get("x-telegram-bot-api-secret-token");

  if (env.TELEGRAM_WEBHOOK_SECRET && secret !== env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const telegram = new TelegramService();
  const update = (await request.json()) as TelegramCallbackUpdate;
  const callback = update.callback_query;
  const supabase = await createClient();
  const appointments = new AppointmentRepository(supabase);
  const checkers = new CheckerRepository(supabase);
  const board = new TelegramBoardService(appointments, new AppSettingRepository(supabase), telegram);

  async function refresh() {
    await board.refreshBoard();
    revalidatePath("/dashboard");
    revalidatePath("/appointments");
    revalidatePath("/checker");
  }

  if (callback) {
    const parsed = telegram.parseStatusCallback(callback.data);
    if (!parsed) {
      await telegram.answerCallback(callback.id, "Unsupported action.", true);
      return NextResponse.json({ ok: true });
    }

    const checkerName = await checkers.nameByTelegramUserId(callback.from.id);

    if (!checkerName) {
      await telegram.answerCallback(callback.id, "Your Telegram account is not registered as a checker.", true);
      return NextResponse.json({ ok: true });
    }

    const updated = await appointments.updateSharedChecker({
      appointment_id: parsed.appointmentId,
      checked_by: checkerName,
      status: parsed.status,
      remarks: ""
    });

    if (!updated) {
      await telegram.answerCallback(callback.id, "Appointment not found.", true);
      return NextResponse.json({ ok: true });
    }

    await telegram.answerCallback(callback.id, `${updated.client_name} marked ${updated.status}.`);
    await refresh();

    return NextResponse.json({ ok: true });
  }

  const message = update.message;
  const messageText = message?.text?.trim();

  if (message && messageText?.toLowerCase() === "/chatid") {
    await telegram.sendChatMessage(message.chat.id, `Chat ID: ${message.chat.id}`);
    return NextResponse.json({ ok: true });
  }

  const textCommand = telegram.parseTextStatusCommand(message?.text);
  if (!textCommand) {
    return NextResponse.json({ ok: true });
  }

  if (!message) {
    return NextResponse.json({ ok: true });
  }

  const matchedAppointment = await appointments.findCheckerAppointmentByClientName(textCommand.clientName);
  if (!matchedAppointment) {
    await telegram.sendChatMessage(
      message.chat.id,
      `No appointment found for "${textCommand.clientName}". Please use the exact client name from the list.`
    );
    return NextResponse.json({ ok: true, message: "Appointment not found" });
  }

  const telegramCheckerName = message.from?.id
    ? await checkers.nameByTelegramUserId(message.from.id)
    : null;
  const checkerName = telegramCheckerName || textCommand.checkerName;

  if (!checkerName) {
    await telegram.sendChatMessage(
      message.chat.id,
      "Checker name missing. Use: Client Name - DONE - Checker Name"
    );
    return NextResponse.json({ ok: true, message: "Checker name missing" });
  }

  let updated;
  try {
    updated = await appointments.updateSharedChecker({
      appointment_id: matchedAppointment.id,
      checked_by: checkerName,
      status: textCommand.status,
      remarks: ""
    });
  } catch (error) {
    await telegram.sendChatMessage(
      message.chat.id,
      error instanceof Error ? error.message : "Unable to update appointment from Telegram."
    );
    return NextResponse.json({ ok: true, message: "Update failed" });
  }

  if (updated) {
    await refresh();
    await telegram.sendChatMessage(
      message.chat.id,
      `${updated.client_name} updated to ${updated.status} by ${updated.checked_by}.`
    );
  }

  return NextResponse.json({ ok: true });
}
