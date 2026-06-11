import type { ServerSupabaseClient } from "@/lib/supabase/server";
import { toAppError } from "@/lib/supabase/errors";

export class AppSettingRepository {
  constructor(private readonly db: ServerSupabaseClient) {}

  async get(key: string) {
    const { data, error } = await this.db.rpc("get_app_setting", { setting_key: key });
    if (error) throw toAppError(error, "Load app setting failed");
    return data;
  }

  async set(key: string, value: string) {
    const { error } = await this.db.rpc("set_app_setting", { setting_key: key, setting_value: value });
    if (error) throw toAppError(error, "Save app setting failed");
  }
}
