// 活動記録一覧ページ

import { supabase } from "@/lib/supabaseClient";
import ActivityLogListPage from "@/components/pages/ActivityLogListPage";
import { Suspense } from "react";

// 活動記録データを全部取ってくる関数
async function fetchActivityLogs() {
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .order("datetime", { ascending: false }); // 活動日の新しい順に並べる

  if (error) {
    console.error("活動記録の取得に失敗:", error.message);
    return [];
  }
  return data || [];
}

export default async function Page() {
  // サーバーサイドで活動記録データを取得
  const logs = await fetchActivityLogs();

  // クライアントコンポーネントにデータを渡す
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      {/* 取得した記録リストをinitialLogsとして渡す */}
      <ActivityLogListPage initialLogs={logs} />
    </Suspense>
  );
}
