// 検索結果ページ
import { supabase } from "@/lib/supabaseClient";
import CommonSearchResultsPage from "@/components/pages/CommonSearchResultsPage";
import { Suspense } from "react";

// 検索キーワードをsearch_historyテーブルに保存する関数
async function saveSearchHistory(query) {
  // キーワードが空っぽ、または短すぎる場合は保存しない
  if (!query || query.trim().length < 2) return;
  // 前後の空白を取り除く
  const trimmedQuery = query.trim();

  // 同じキーワードの古い履歴があれば削除する
  const { error: deleteError } = await supabase
    .from("search_history") // 検索履歴テーブル
    .delete() // 削除操作
    .eq("query", trimmedQuery); // query カラムが同じものを削除

  //もし削除に失敗したらログに出す
  if (deleteError) {
    console.error("重複履歴の削除に失敗:", deleteError.message);
    // 削除に失敗しても、とりあえず新しい履歴の追加は試みる
  }

  // その後、新しく履歴を追加する
  const { error } = await supabase
    .from("search_history") // 検索履歴テーブル
    .insert({ query: trimmedQuery }); // query カラムにキーワードを保存

  //もし追加に失敗したらログに出す
  if (error) {
    console.error("検索履歴の保存に失敗:", error.message);
  }
}

// キーワードに一致する events を検索する関数
async function fetchSearchResults(query) {
  //もしキーワードが空っぽなら空配列を返す
  if (!query) return [];

  // event_tags と tags も一緒に取得する
  const { data, error } = await supabase
    .from("events") // イベントテーブル
    .select(
      `
      *,
      event_tags (
        tags (
          *
        )
      )
    `
    ) // event_tags と tags も一緒に取得
    .or(`name.ilike.%${query}%,long_description.ilike.%${query}%`); // 名前または詳細説明にキーワードが含まれるものを検索

  //もし検索に失敗したらログに出して空配列を返す
  if (error) {
    console.error("イベント検索に失敗:", error.message);
    // エラー時は空配列を返す
    return [];
  }

  // データが存在しない場合は空配列を返す
  if (!data) return [];

  // データを整形して tags 配列を作る
  const formattedEvents = data.map(event => {
    // tags 配列を抽出
    const tags = event.event_tags
      ? event.event_tags.map(item => item.tags).filter(tag => tag !== null)
      : [];
    // 整形したオブジェクトを返す
    return { ...event, tags };
  });

  // 整形したデータを返す
  return formattedEvents;
}

// ページ本体
// クライアントコンポーネントにデータを渡す
export default async function Page({ searchParams }) {
  // URLの「?q=...」の部分 (searchParams) からキーワードを取り出す
  const awaitedParams = await searchParams;
  // キーワードを取得
  const query = awaitedParams.q || "";
  // 検索履歴保存のPromiseを作成
  const saveHistoryPromise = saveSearchHistory(query);
  // イベント検索のPromiseを作成
  const fetchEventsPromise = fetchSearchResults(query);
  // 両方の処理が終わるのを待つ
  const [_, events] = await Promise.all([
    saveHistoryPromise,
    fetchEventsPromise,
  ]);

  // タイトル用の文字列を作成
  let titleText = "";
  // もしキーワードが存在する場合
  if (query) {
    titleText =
      events.length > 0
        ? `「${query}」の検索結果(${events.length}件)`
        : `「${query}」に一致するイベントは見つかりませんでした。`;
  }

  // パンくずリスト用データを作成
  const crumbs = [
    { label: "キーワードから探す", href: "/search/keyword" }, // 親ページ
    { label: "検索結果", href: `/search/results?q=${query}` }, // 最後のページ
  ];

  // クライアントコンポーネントにデータを渡す
  return (
    <Suspense fallback={<div>結果を読み込み中...</div>}>
      <CommonSearchResultsPage
        titleText={titleText}
        events={events}
        crumbs={crumbs}
        source="keyword"
        query={query}
      />
    </Suspense>
  );
}
