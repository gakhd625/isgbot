import { AppSettingRepository } from "@/repositories/app-setting-repository";
import { AppointmentRepository } from "@/repositories/appointment-repository";
import { TelegramService } from "@/services/telegram-service";

const boardMessageSettingKey = "telegram_board_message_id";
const boardMessageIdsSettingKey = "telegram_board_message_ids";

export class TelegramBoardService {
  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly settings: AppSettingRepository,
    private readonly telegram = new TelegramService()
  ) {}

  async refreshBoard() {
    if (!this.telegram.isConfigured()) return;

    const appointments = await this.appointments.listForSharedChecker();
    const existingMessageIds = await this.settings.get(boardMessageIdsSettingKey);
    const existingSingleMessageId = await this.settings.get(boardMessageSettingKey);

    const messagesToDelete = new Set<number>();
    if (existingMessageIds) {
      try {
        const parsed = JSON.parse(existingMessageIds) as number[];
        parsed.forEach((messageId) => messagesToDelete.add(messageId));
      } catch (error) {
        console.error(error);
      }
    }
    if (existingSingleMessageId) {
      messagesToDelete.add(Number(existingSingleMessageId));
    }

    for (const messageId of messagesToDelete) {
      try {
        await this.telegram.deleteMessage(process.env.TELEGRAM_CHAT_ID ?? "", messageId);
      } catch (error) {
        console.error(error);
      }
    }

    const messages = await this.telegram.postBoardMessages(appointments);
    if (!messages.length) return;

    await this.settings.set(
      boardMessageIdsSettingKey,
      JSON.stringify(messages.map((message) => message.messageId))
    );
    await this.settings.set(boardMessageSettingKey, String(messages[0].messageId));
  }
}
