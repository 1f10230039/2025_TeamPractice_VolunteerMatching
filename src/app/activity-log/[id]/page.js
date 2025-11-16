// イベント詳細ページ (サーバーコンポーネント)

import { supabase } from "@/lib/supabaseClient";
import ActivityLogDetailPage from "@/components/pages/ActivityLogDetailPage";
import { Suspense } from "react";

/**
 * イベント詳細ページを生成するサーバーコンポーネント
 * @param {object} props - コンポーネントのプロパティ
 * @param {object} props.params - URLから渡されるパラメータ ({ id: '...' })
 */
export default async function Page({ params }) {
  const { id } = await params; // URLパラメータからIDを取得

  // Supabaseから、そのIDの記録1件だけを取得する
  const { data: log, error } = await supabase
    .from("activity_log") // activity_logテーブルから
    .select("*")
    .eq("id", id) // idカラムが URLのid と一致する
    .single(); // 1件だけ取得

  // エラー処理 (記録が見つからなかった場合)
  if (error || !log) {
    console.error("活動記録の取得に失敗しました:", error?.message);
    return <div>活動記録が見つかりませんでした。</div>;
  }

  // 取得した1件のデータを、クライアントコンポーネントに渡す
  return (
    <Suspense fallback={<div>記録を読み込み中...</div>}>
      <ActivityLogDetailPage log={log} />
    </Suspense>
  );
}
