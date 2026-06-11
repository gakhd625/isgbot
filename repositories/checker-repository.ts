import type { ServerSupabaseClient } from "@/lib/supabase/server";
import { toAppError } from "@/lib/supabase/errors";

export class CheckerRepository {
  constructor(private readonly db: ServerSupabaseClient) {}

  async active() {
    const { data, error } = await this.db
      .from("checkers")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true });
    if (error) throw toAppError(error, "Load checkers failed");
    return data;
  }

  async nameByTelegramUserId(userId: number) {
    const { data, error } = await this.db.rpc("get_checker_name_by_telegram_user_id", { user_id: userId });
    if (error) throw toAppError(error, "Load checker Telegram identity failed");
    return data;
  }
}
