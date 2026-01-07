import { supabase } from "@/lib/supabaseClient";
import HomePage from "@/components/pages/HomePage";
import { Suspense } from "react";

// 開発中はキャッシュを無効にして、常に最新データを取得するようにする
export const revalidate = 0;

async function fetchEventsWithTags() {
  // Supabaseからデータを取得
  // eventsテーブルの全カラム (*) と、 紐付いている event_tags テーブル経由で tags テーブルの全カラム (*) を取得
  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      event_tags (
        tags (
          *
        )
      )
    `
    )
    .eq("recommended", true) // recommendedカラムが true のものだけに絞り込む
    .order("created_at", { ascending: false }); // 新着順

  if (error) {
    console.error("イベントデータの取得に失敗:", error.message);
    return [];
  }

  if (!data) return [];

  // データを整形する
  // Supabaseからの返却値は { ...event, event_tags: [{ tags: { name: '...' } }] }  のような深いネスト構造になっているので、EventCardで使いやすいフラットな配列に変換する
  const formattedEvents = data.map(event => {
    // event_tags があれば、そこから tags オブジェクトだけを抜き出して配列にする
    const tags = event.event_tags
      ? event.event_tags.map(item => item.tags).filter(tag => tag !== null)
      : [];

    return {
      ...event,
      tags: tags, // 整形したタグ配列を tags プロパティとして持たせる
      // (古い tag カラムも ...event でそのまま残しておく)
    };
  });

  return formattedEvents;
}

export default async function Page() {
  // タグ付きのイベントデータを取得
  const events = await fetchEventsWithTags();

  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <HomePage events={events} />
    </Suspense>
  );
}
