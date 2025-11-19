// src/lib/supabaseServer.js

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * サーバーコンポーネント専用のSupabaseクライアントを作成する関数
 *
 * サーバーコンポーネント ('use client' がない .js/.jsx) や
 * ルートハンドラー (app/api/...) で使用します。
 * Next.js の 'cookies()' 関数が Promise を返す仕様に対応するため、
 * get/set/remove をすべて async/await で非同期処理します。
 *
 * @returns {object} サーバーサイドで動作するSupabaseクライアントインスタンス
 */
export function createSupabaseServerClient() {
  // createServerClient に渡す cookie オブジェクト
  return createServerClient(
    // .env.local から環境変数を読み込む
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        /**
         * Cookieストアから指定された名前のクッキーを取得する (非同期)
         * @param {string} name - 取得したいクッキーの名前
         */
        async get(name) {
          try {
            // cookies() 関数を await で呼び出す
            const cookieStore = await cookies();

            if (cookieStore && typeof cookieStore.get === "function") {
              return cookieStore.get(name)?.value;
            }
            return undefined; // 取得失敗
          } catch (error) {
            console.error("Failed to call cookies() in get:", error);
            return undefined;
          }
        },
        /**
         * Cookieストアにクッキーを設定する (非同期)
         * (Server Actions など、書き込み可能なコンテキストでのみ動作)
         */
        async set(name, value, options) {
          try {
            // cookies() 関数を await で呼び出す
            const cookieStore = await cookies();
            if (cookieStore && typeof cookieStore.set === "function") {
              cookieStore.set({ name, value, ...options });
            }
          } catch (error) {
            // ページ読み込み時 (GET) など書き込み不可な
            // コンテキストで呼ばれた場合のエラーは無視する
          }
        },
        /**
         * Cookieストアからクッキーを削除する (非同期)
         * (Server Actions など、書き込み可能なコンテキストでのみ動作)
         */
        async remove(name, options) {
          try {
            // cookies() 関数を await で呼び出す
            const cookieStore = await cookies();
            if (cookieStore && typeof cookieStore.set === "function") {
              // 'remove' は 'set' で value を空にすることで代用
              cookieStore.set({ name, value: "", ...options });
            }
          } catch (error) {
            // (書き込みエラーはここでは無視)
          }
        },
      },
    }
  );
}
