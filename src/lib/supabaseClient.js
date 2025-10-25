import { createClient } from "@supabase/supabase-js";

// .env.localファイルからSupabaseのURLとanon keyを読み込む
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 読み込んだ情報を使って、Supabaseに接続するためのクライアントを作成
// これを他のファイルでインポートして使っていく
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
