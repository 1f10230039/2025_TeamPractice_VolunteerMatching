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

  // Supabaseから、そのIDのイベント 1件だけを取得する
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  // エラー処理
  if (error || !event) {
    console.error("編集対象のイベント取得に失敗:", error?.message);
    return <div>編集するイベントが見つかりませんでした。</div>;
  }

  // 取得した 1件 のデータを、フォームコンポーネントに渡す
  return (
    <Suspense fallback={<div>フォームを読み込み中...</div>}>
      {/* eventToEdit という名前で props を渡す */}
      <EventAdminForm eventToEdit={event} />
    </Suspense>
  );
}
