import { supabase } from "@/lib/supabaseClient";
import MyListPage from "@/components/pages/MyListPage";
import { Suspense } from "react";

// お気に入りイベント取得用の非同期関数
async function fetchFavoriteEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("favorite", true);

  if (error) {
    console.error("お気に入りデータの取得に失敗:", error.message);
    return []; // エラーなら空を返す
  }
  return data || [];
}

// 応募済みイベント取得用の非同期関数
async function fetchAppliedEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("applied", true);

  if (error) {
    console.error("応募済みデータの取得に失敗しました:", error.message);
    return []; // エラーなら空を返す
  }
  return data || [];
}

export default async function Page() {
  // 2つのデータ取得を並行して実行する
  const favoriteEventsData = fetchFavoriteEvents();
  const appliedEventsData = fetchAppliedEvents();

  // Suspense とは別に、両方の完了を待つ
  const [favoriteEvents, appliedEvents] = await Promise.all([
    favoriteEventsData,
    appliedEventsData,
  ]);

  // 取得したデータを、クライアントコンポーネントに渡す
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <MyListPage
        initialFavoriteEvents={favoriteEvents}
        initialAppliedEvents={appliedEvents}
      />
    </Suspense>
  );
}
