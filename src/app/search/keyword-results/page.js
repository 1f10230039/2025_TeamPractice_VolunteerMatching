// 検索結果ページ (サーバーコンポーネント)

import { supabase } from "@/lib/supabaseClient";
import CommonSearchResultsPage from "@/components/pages/CommonSearchResultsPage";
import { Suspense } from "react";

// 検索キーワードをsearch_historyテーブルに保存する関数
async function saveSearchHistory(query) {
  // キーワードが空っぽ、または短すぎる場合は保存しない
  if (!query || query.trim().length < 2) return;

  const { error } = await supabase
    .from("search_history")
    .insert({ query: query.trim() }); // queryカラムにキーワードを保存

  if (error) {
    // 履歴保存のエラーは、検索機能自体には影響ないので、コンソールにだけ出す
    console.error("検索履歴の保存に失敗:", error.message);
  }
}

// キーワードに一致するeventsを検索する関数
async function fetchSearchResults(query) {
  if (!query) return []; // クエリが空なら空を返す

  // name(イベント名)またはlong_description(詳細文) にキーワードが部分一致するものを探す
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .or(`name.ilike.%${query}%,long_description.ilike.%${query}%`); // or条件で検索

  if (error) {
    console.error("イベント検索に失敗:", error.message);
    return []; // エラーなら空を返す
  }
  return data || [];
}

// ページ本体 (サーバーコンポーネント)
export default async function Page({ searchParams }) {
  // URLの「?q=...」の部分 (searchParams) からキーワードを取り出す
  const awaitedParams = await searchParams;
  const query = awaitedParams.q || "";

  // 「履歴の保存」と「イベントの検索」を並行して実行させる
  const saveHistoryPromise = saveSearchHistory(query);
  const fetchEventsPromise = fetchSearchResults(query);

  // 両方の処理が終わるのを待つ
  const [_, events] = await Promise.all([
    saveHistoryPromise,
    fetchEventsPromise,
  ]);

  // タイトル用の文字列を作成
  let titleText = "";
  if (query) {
    titleText =
      events.length > 0
        ? `「${query}」の検索結果 (${events.length}件)`
        : `「${query}」に一致するイベントは見つかりませんでした。`;
  }

  // クライアントコンポーネントにデータを渡す
  return (
    <Suspense fallback={<div>結果を読み込み中...</div>}>
      <CommonSearchResultsPage titleText={titleText} events={events} />
    </Suspense>
  );
}
