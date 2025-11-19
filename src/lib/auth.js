// src/lib/auth.js

import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * 現在ログインしているユーザーを取得する共通関数
 *
 * @returns {Promise<object|null>} ログインしていればUserオブジェクト、していなければnull
 */
export async function getAuthUser() {
  const supabase = createSupabaseServerClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("認証チェックエラー:", error);
    return null;
  }
}
