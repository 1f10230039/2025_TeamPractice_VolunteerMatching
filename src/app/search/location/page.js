// 場所検索ページ
import { supabase } from "@/lib/supabaseClient";
import LocationSearchPage from "@/components/pages/LocationSearchPage";
import { Suspense } from "react";

// 都道府県データを全部取ってくる関数
async function fetchPrefectures() {
  // Supabaseから都道府県データを取得
  const { data, error } = await supabase
    .from("prefectures") // 都道府県テーブル
    .select("*") // 全カラム取得
    .order("prefecture-code", { ascending: true }); // 都道府県コード順に並べる

  //もしエラーがあればログに出して空配列を返す
  if (error) {
    console.error("都道府県の取得に失敗:", error.message);
    // エラー時は空配列を返す
    return [];
  }
  // 正常に取得できたらデータを返す
  return data || [];
}

// ページコンポーネント
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
