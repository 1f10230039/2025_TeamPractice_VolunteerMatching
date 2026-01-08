// キーワード検索ページ
import { supabase } from "@/lib/supabaseClient";
import KeywordSearchPage from "@/components/pages/KeywordSearchPage";
import { Suspense } from "react";

// 履歴データを取ってくる関数
async function fetchSearchHistory() {
  // Supabaseから検索履歴を取得
  const { data, error } = await supabase
    .from("search_history") // 検索履歴テーブル
    .select("*") // 全カラム取得
    .order("created_at", { ascending: false }) // 新しい順に並べる
    .limit(10); // 最新10件だけ取得

  //もしエラーがあればログに出して空配列を返す
  if (error) {
    console.error("検索履歴の取得に失敗:", error.message);
    // エラー時は空配列を返す
    return [];
  }
  // 正常に取得できたらデータを返す
  return data || [];
}

// ページコンポーネント
export default async function Page() {
  // サーバーサイドで履歴データを取得
  const history = await fetchSearchHistory();

  // クライアントコンポーネントに履歴データを渡す
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <KeywordSearchPage initialHistory={history} />
    </Suspense>
  );
}
