// 編集ページを生成するサーバーコンポーネント

import { supabase } from "@/lib/supabaseClient";
import ActivityLogForm from "@/components/activity-log/ActivityLogForm";
import { Suspense } from "react";

/**
 * 編集ページを生成するサーバーコンポーネント
 * @param {object} props
 * @param {object} props.params - URLから渡されるパラメータ ({ id: '...' })
 */
export default async function Page({ params }) {
  // params からidを取り出す
  const { id } = await params;

  // Supabaseから、そのIDの記録1件だけを取得する
  const { data: log, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("id", id)
    .single();

  // エラー処理
  if (error || !log) {
    console.error("編集対象の記録取得に失敗:", error?.message);
    return <div>編集する記録が見つかりませんでした。</div>;
  }

  // 取得した1件のデータを、フォームコンポーネントに渡す
  return (
    <Suspense fallback={<div>フォームを読み込み中...</div>}>
      {/* logToEditという名前でpropsを渡す */}
      <ActivityLogForm logToEdit={log} />
    </Suspense>
  );
}
