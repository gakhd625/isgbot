type SupabaseLikeError = {
  message?: string;
  details?: string | null;
  hint?: string | null;
  code?: string;
};

export function toAppError(error: unknown, context: string) {
  if (error instanceof Error) return error;

  const supabaseError = error as SupabaseLikeError;
  const message = supabaseError.message || "Unknown Supabase error";
  const details = supabaseError.details ? ` Details: ${supabaseError.details}` : "";
  const hint = supabaseError.hint ? ` Hint: ${supabaseError.hint}` : "";
  const code = supabaseError.code ? ` (${supabaseError.code})` : "";

  return new Error(`${context}: ${message}${code}.${details}${hint}`);
}
