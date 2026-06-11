import { format } from "date-fns";
import type { Appointment, AppointmentStatus } from "@/types/database";
import { serverEnv } from "@/lib/env";

type TelegramMessageResponse = {
  ok: boolean;
  result?: {
    message_id: number;
    chat: {
      id: number | string;
    };
  };
  description?: string;
};

export type TelegramCallbackUpdate = {
  callback_query?: {
    id: string;
    data?: string;
    from: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
    message?: {
      message_id: number;
      chat: {
        id: number | string;
      };
    };
  };
  message?: {
    text?: string;
    from?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number | string;
    };
  };
};

const actionStatuses: AppointmentStatus[] = ["Confirmed", "Done", "Reschedule", "No Show", "Cancelled"];
const boardStatuses: AppointmentStatus[] = ["Pending", "Confirmed", "Done", "Reschedule", "No Show", "Cancelled"];

export type BoardAppointment = Pick<
  Appointment,
  | "id"
  | "client_name"
  | "phone_number"
  | "area"
  | "appointment_date"
  | "appointment_time"
  | "status"
  | "remarks"
  | "checked_by"
> & {
  setter_name?: string;
};

export class TelegramService {
  private readonly token?: string;
  private readonly chatId?: string;

  constructor() {
    const env = serverEnv();
    this.token = env.TELEGRAM_BOT_TOKEN;
    this.chatId = env.TELEGRAM_CHAT_ID;
  }

  isConfigured() {
    return Boolean(this.token && this.chatId);
  }

  private async request<T>(method: string, body: Record<string, unknown>): Promise<T | null> {
    if (!this.token) return null;

    const response = await fetch(`https://api.telegram.org/bot${this.token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const payload = (await response.json().catch(() => null)) as { description?: string } | null;
    if (!response.ok) {
      throw new Error(`Telegram ${method} failed: ${response.status}${payload?.description ? ` ${payload.description}` : ""}`);
    }

    return payload as T;
  }

  private appointmentKeyboard(appointmentId: string) {
    return {
      inline_keyboard: [
        actionStatuses.slice(0, 2).map((status) => ({
          text: status,
          callback_data: `set:${appointmentId}:${status}`
        })),
        actionStatuses.slice(2).map((status) => ({
          text: status,
          callback_data: `set:${appointmentId}:${status}`
        }))
      ]
    };
  }

  private dateHeader(date: string) {
    return `‼️ ${format(new Date(`${date}T00:00:00`), "EEEE MMMM d, yyyy").toUpperCase()}‼️`;
  }

  private displayTime(time: string) {
    const [hourValue, minuteValue] = time.slice(0, 5).split(":").map(Number);
    const suffix = hourValue >= 12 ? "PM" : "AM";
    const hour = hourValue % 12 || 12;
    return minuteValue ? `${hour}:${String(minuteValue).padStart(2, "0")}${suffix}` : `${hour}${suffix}`;
  }

  private areaHeader(area: string, time: string) {
    const normalized = area.toLowerCase();
    const label =
      normalized.includes("island central") || no
      
      
      
      rmalized === "icm"
        ? "ICM"
        : normalized.includes("sm city")
          ? "SM CITY"
          : normalized.includes("parkmall")
            ? "PARKMALL"
            : normalized.includes("seaside")
              ? "SEASIDE"
              : normalized.includes("lacion")
                ? "SM LACION"
                : area.toUpperCase();

    return `--${label} ${this.displayTime(time)}--`;
  }

  private statusMark(status: AppointmentStatus) {
    if (status === "Done" || status === "Confirmed") return "✅";
    if (status === "Cancelled" || status === "No Show") return "❌";
    if (status === "Reschedule") return "↻";
    return "";
  }

  private boardLines(appointments: BoardAppointment[]) {
    const grouped = appointments.reduce<Record<string, BoardAppointment[]>>((groups, appointment) => {
      const key = `${appointment.appointment_date} | ${appointment.area} | ${appointment.appointment_time.slice(0, 5)}`;
      groups[key] = groups[key] ?? [];
      groups[key].push(appointment);
      return groups;
    }, {});

    const lines = ["APPOINTMENT LIST", `Updated: ${new Date().toLocaleString("en-US", { hour12: true })}`, ""];
    let currentDate = "";

    for (const [key, rows] of Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))) {
      const [date, area, time] = key.split(" | ");
      if (date !== currentDate) {
        if (currentDate) lines.push("");
        lines.push(this.dateHeader(date));
        lines.push("");
        currentDate = date;
      }

      lines.push(this.areaHeader(area, time));
      lines.push("");
      rows
        .sort((a, b) => a.client_name.localeCompare(b.client_name))
        .forEach((appointment) => {
          const mark = this.statusMark(appointment.status);
          const remarks = appointment.remarks ? ` (${appointment.remarks})` : "";
          lines.push(`${mark}${appointment.client_name} - ${appointment.phone_number}${remarks}`);
        });
      lines.push("");
    }

    lines.push("Update format:");
    lines.push("Client Name - DONE - Checker Name");
    return lines;
  }

  private boardMessages(appointments: BoardAppointment[]) {
    const messages: string[] = [];
    let current = "";

    for (const line of this.boardLines(appointments)) {
      const next = current ? `${current}\n${line}` : line;
      if (next.length > 3600) {
        messages.push(current);
        current = line;
      } else {
        current = next;
      }
    }

    if (current) messages.push(current);
    return messages.map((message, index) =>
      messages.length > 1 ? `${message}\n\nPage ${index + 1}/${messages.length}` : message
    );
  }

  async postBoard(appointments: BoardAppointment[]) {
    if (!this.chatId) return null;

    const [text] = this.boardMessages(appointments);
    const response = await this.request<TelegramMessageResponse>("sendMessage", {
      chat_id: this.chatId,
      text: text ?? "APPOINTMENT LIST\nNo appointments.",
      disable_web_page_preview: true
    });

    return response?.result
      ? {
          chatId: String(response.result.chat.id),
          messageId: response.result.message_id
        }
      : null;
  }

  async postBoardMessages(appointments: BoardAppointment[]) {
    if (!this.chatId) return [];

    const messages = this.boardMessages(appointments);
    const sent: Array<{ chatId: string; messageId: number }> = [];

    for (const text of messages.length ? messages : ["APPOINTMENT LIST\nNo appointments."]) {
      const response = await this.request<TelegramMessageResponse>("sendMessage", {
        chat_id: this.chatId,
        text,
        disable_web_page_preview: true
      });

      if (response?.result) {
        sent.push({
          chatId: String(response.result.chat.id),
          messageId: response.result.message_id
        });
      }
    }

    return sent;
  }

  async editBoard(messageId: number, appointments: BoardAppointment[]) {
    if (!this.chatId) return null;

    const [text] = this.boardMessages(appointments);
    return this.request("editMessageText", {
      chat_id: this.chatId,
      message_id: messageId,
      text: text ?? "APPOINTMENT LIST\nNo appointments.",
      disable_web_page_preview: true
    });
  }

  async deleteMessage(chatId: number | string, messageId: number) {
    return this.request("deleteMessage", {
      chat_id: chatId,
      message_id: messageId
    });
  }

  async postAppointment(appointment: Appointment) {
    if (!this.chatId) return null;

    const response = await this.request<TelegramMessageResponse>("sendMessage", {
      chat_id: this.chatId,
      text: [
        "NEW APPOINTMENT",
        "",
        `Client: ${appointment.client_name}`,
        `Phone: ${appointment.phone_number}`,
        `Area: ${appointment.area}`,
        `Schedule: ${appointment.appointment_date} ${appointment.appointment_time.slice(0, 5)}`,
        `Setter: ${appointment.setter_name}`,
        `Status: ${appointment.status}`
      ].join("\n"),
      reply_markup: this.appointmentKeyboard(appointment.id),
      disable_web_page_preview: true
    });

    return response?.result
      ? {
          chatId: String(response.result.chat.id),
          messageId: response.result.message_id
        }
      : null;
  }

  async answerCallback(callbackQueryId: string, text: string, alert = false) {
    return this.request("answerCallbackQuery", {
      callback_query_id: callbackQueryId,
      text,
      show_alert: alert
    });
  }

  async sendChatMessage(chatId: number | string, text: string) {
    return this.request("sendMessage", {
      chat_id: chatId,
      text,
      disable_web_page_preview: true
    });
  }

  async notifyStatusUpdated(input: {
    client_name: string;
    checked_by: string;
    old_status: AppointmentStatus;
    new_status: AppointmentStatus;
    remark: string | null;
    updated_at: string;
  }) {
    if (!this.chatId) return null;

    return this.request("sendMessage", {
      chat_id: this.chatId,
      text: [
        "APPOINTMENT UPDATED",
        "",
        `Client: ${input.client_name}`,
        `Checked By: ${input.checked_by}`,
        `Old Status: ${input.old_status}`,
        `New Status: ${input.new_status}`,
        `Remark: ${input.remark || "None"}`,
        `Time: ${input.updated_at}`
      ].join("\n"),
      disable_web_page_preview: true
    });
  }

  parseStatusCallback(data: string | undefined) {
    if (!data) return null;
    const [action, appointmentId, ...statusParts] = data.split(":");
    const status = statusParts.join(":") as AppointmentStatus;

    if (action !== "set" || !appointmentId || !actionStatuses.includes(status)) return null;
    return { appointmentId, status };
  }

  parseTextStatusCommand(text: string | undefined) {
    if (!text) return null;
    const parts = text
      .split("-")
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length < 2) return null;

    const rawStatus = parts[1].toLowerCase();
    const status = boardStatuses.find((item) => item.toLowerCase() === rawStatus);
    if (!status) return null;

    return {
      clientName: parts[0],
      status,
      checkerName: parts[2] || null
    };
  }
}
