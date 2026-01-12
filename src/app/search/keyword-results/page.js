// 検索結果ページ
import { supabase } from "@/lib/supabaseClient";
import CommonSearchResultsPage from "@/components/pages/CommonSearchResultsPage";
import SearchHistoryRecorder from "@/components/search/SearchHistoryRecorder";
import { Suspense } from "react";

// キーワードに一致する events を検索する関数
async function fetchSearchResults(query) {
  if (!query) return [];

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      event_tags (
        tags ( * )
      )
    `
    )
    .or(`name.ilike.%${query}%,long_description.ilike.%${query}%`);

  if (error || !data) return [];

  const formattedEvents = data.map(event => {
    const tags = event.event_tags
      ? event.event_tags.map(item => item.tags).filter(tag => tag !== null)
      : [];
    return { ...event, tags };
  });

  return formattedEvents;
}

// ページ本体
export default async function Page({ searchParams }) {
  const awaitedParams = await searchParams;
  const query = awaitedParams.q || "";

  // 検索処理
  const events = await fetchSearchResults(query);

  let titleText = "";
  if (query) {
    titleText =
      events.length > 0
        ? `「${query}」の検索結果(${events.length}件)`
        : `「${query}」に一致するイベントは見つかりませんでした。`;
  }

  const crumbs = [
    { label: "キーワードから探す", href: "/search/keyword" },
    { label: "検索結果", href: `/search/results?q=${query}` },
  ];

  return (
    <Suspense fallback={<div>結果を読み込み中...</div>}>
      <SearchHistoryRecorder query={query} />

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
