import type { ServerSupabaseClient } from "@/lib/supabase/server";
import { toAppError } from "@/lib/supabase/errors";

export class AreaRepository {
  constructor(private readonly db: ServerSupabaseClient) {}

  async active() {
    const { data, error } = await this.db
      .from("areas")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw toAppError(error, "Load appointment areas failed");
    return data;
  }
}
