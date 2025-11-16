// src/lib/supabaseClient.js

import { createBrowserClient } from "@supabase/ssr";

/**
 * クライアントコンポーネント専用のSupabaseクライアントを作成する関数
 *
 * "use client" が指定されたファイル (LoginPage.jsx, SignupPage.jsx など) で使用します。
 * 認証トークンは localStorage ではなく cookies に保存されます。
 *
 * @returns {object} ブラウザ(クライアント)で動作するSupabaseクライアントインスタンス
 */
function createSupabaseClient() {
  // @supabase/supabase-js の 'createClient' ではなく、
  // @supabase/ssr の 'createBrowserClient' を使用します
  return createBrowserClient(
    // .env.local から環境変数を読み込む
    // (NEXT_PUBLIC_ のプレフィックスによりクライアント側で読み取り可能)
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// createSupabaseClient 関数を一度だけ呼び出し、
// そのインスタンスを 'supabase' という名前でエクスポート (シングルトンパターン)
//
// これにより、他のクライアントコンポーネントで
// import { supabase } from '@/lib/supabaseClient'
// と書くだけで、常に同じクライアントインスタンスを使用できる
export const supabase = createSupabaseClient();
