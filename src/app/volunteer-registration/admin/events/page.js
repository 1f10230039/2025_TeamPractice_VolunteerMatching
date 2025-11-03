// ボランティア募集管理のイベント一覧ページ

import { supabase } from "@/lib/supabaseClient";
import EventAdminListPage from "@/components/pages/EventAdminListPage";
import { Suspense } from "react";

// events データを全部取ってくる関数
async function fetchAllEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false }); // 新しく作られた順に並べる

  if (error) {
    console.error("イベントの取得に失敗:", error.message);
    return [];
  }
  return data || [];
}

export default async function Page() {
  // サーバーサイドでイベントデータを取得
  const events = await fetchAllEvents();

  // クライアントコンポーネントにデータを渡す
  return (
    <Suspense fallback={<div>イベント一覧を読み込み中...</div>}>
      {/* 取得したリストを "initialEvents" として渡す */}
      <EventAdminListPage initialEvents={events} />
    </Suspense>
  );
}
