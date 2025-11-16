// 場所検索ページ

import { supabase } from "@/lib/supabaseClient";
import LocationSearchPage from "@/components/pages/LocationSearchPage";
import { Suspense } from "react";

// 都道府県データを全部取ってくる関数
async function fetchPrefectures() {
  const { data, error } = await supabase
    .from("prefectures")
    .select("*")
    .order("prefecture-code", { ascending: true });

  if (error) {
    console.error("都道府県の取得に失敗:", error.message);
    return [];
  }
  return data || [];
}

export default async function Page() {
  // サーバーサイドで都道府県データを取得
  const prefectures = await fetchPrefectures();

  // クライアントコンポーネントにデータを渡す
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <LocationSearchPage initialPrefectures={prefectures} />
    </Suspense>
  );
}
