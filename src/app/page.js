// ホームページコンポーネント
import { supabase } from "@/lib/supabaseClient";
import HomePage from "@/components/pages/HomePage";
import { Suspense } from "react";

// 開発中はキャッシュを無効にして、常に最新データを取得するようにする
export const revalidate = 0;

// タグ付きのイベントデータを取得する関数
async function fetchEventsWithTags() {
  // Supabaseからイベントデータを取得
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
    ) // 全てのカラムを取得、関連するタグもネストで取得
    .eq("recommended", true) // おすすめイベントのみ
    .order("created_at", { ascending: false }); // 作成日の降順で並び替え

  //　もしエラーが発生したら空配列を返す
  if (error) {
    console.error("イベントデータの取得に失敗:", error.message);
    // 空配列を返す
    return [];
  }

  // データが存在しない場合も空配列を返す
  if (!data) return [];

  // 取得したデータをタグ形式に整形
  const formattedEvents = data.map(event => {
    // event_tags から tags 配列を抽出
    const tags = event.event_tags
      ? event.event_tags.map(item => item.tags).filter(tag => tag !== null)
      : [];

    // tags 配列をフラット化（多重配列を一次元に）
    return {
      ...event,
      tags: tags, // 整形したタグ配列を tags プロパティとして持たせる
      // (古い tag カラムも ...event でそのまま残しておく)
    };
  });

  // 整形したイベントデータを返す
  return formattedEvents;
}

// ホームページコンポーネント本体
export default async function Page() {
  // タグ付きのイベントデータを取得
  const events = await fetchEventsWithTags();

  // ホームページコンポーネントを表示
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <HomePage events={events} />
    </Suspense>
  );
}
