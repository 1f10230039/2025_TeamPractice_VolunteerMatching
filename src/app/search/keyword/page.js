// キーワード検索ページ

import { supabase } from "@/lib/supabaseClient";
import KeywordSearchPage from "@/components/pages/KeywordSearchPage";
import { Suspense } from "react";

// 履歴データを取ってくる関数
async function fetchSearchHistory() {
  const { data, error } = await supabase
    .from("search_history")
    .select("*")
    .order("created_at", { ascending: false }) // 新しい順に並べる
    .limit(10); // とりあえず最新10件

  if (error) {
    console.error("検索履歴の取得に失敗:", error.message);
    return [];
  }
  return data || [];
}

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
