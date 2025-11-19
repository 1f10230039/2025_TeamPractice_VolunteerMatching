// ボランティア募集イベント編集ページのサーバーコンポーネント

import { supabase } from "@/lib/supabaseClient";
import EventAdminForm from "@/components/events/EventAdminForm";
import { Suspense } from "react";

/**
 * 編集ページを生成するサーバーコンポーネント
 * @param {object} props
 * @param {object} props.params - URLから渡されるパラメータ ({ id: '...' })
 */
export default async function Page({ params }) {
  // params からidを取り出す
  const { id } = await params;

  // Supabaseから、編集対象のイベントデータを1件取得する
  const { data: event, error } = await supabase
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
    .eq("id", id)
    .single();

  if (error || !event) {
    console.error("編集対象のイベント取得に失敗:", error?.message);
    return <div>編集するイベントが見つかりませんでした。</div>;
  }

  // event_tags から tags だけを抜き出して、フラットな配列にする
  const tags = event.event_tags
    ? event.event_tags.map(item => item.tags).filter(tag => tag !== null)
    : [];

  // 整形したデータをフォームに渡す
  const eventWithTags = { ...event, tags };

  return (
    <Suspense fallback={<div>フォームを読み込み中...</div>}>
      <EventAdminForm eventToEdit={eventWithTags} />
    </Suspense>
  );
}
