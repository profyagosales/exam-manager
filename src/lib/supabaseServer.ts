// src/lib/supabaseServer.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

/**
 * Supabase client para Server Components (Next 15.4)
 * Usa a nova interface assíncrona cookies()
 */
export async function createSupabaseServer() {
  const cookieStore = await cookies(); // agora é assíncrono

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) =>
          cookieStore.set({ name, value, ...options }),
        remove: (name: string, options: CookieOptions) =>
          cookieStore.delete({ name, ...options }),
      },
      headers: {
        get: (key: string) => headers().get(key) ?? undefined,
      },
    }
  );
}
