// 市町村コードに基づくイベント検索結果ページ (サーバーコンポーネント)
import { supabase } from "@/lib/supabaseClient";
import CommonSearchResultsPage from "@/components/pages/CommonSearchResultsPage";
import { Suspense } from "react";

/**
 * URLから渡された市町村コードに一致するイベントを取得する
 * @param {number[]} codesArray - 市町村コードの配列
 * @returns {Promise<Array>} イベントの配列
 */
async function fetchEventsByCityCodes(codesArray) {
  // コードが1つもなければ、空の配列を返す
  if (!codesArray || codesArray.length === 0) {
    return [];
  }

  // コードから「市町村名」のリストを取得する
  const { data: citiesData, error: citiesError } = await supabase
    .from("cities")
    .select("name")
    .in("city-code", codesArray);

  if (citiesError) {
    console.error("市町村名の取得に失敗:", citiesError.message);
    return [];
  }

  // 複数の市町村が選択されていた場合に備えて、名前だけの配列を作る
  const cityNames = citiesData.map(city => city.name);

  // もし一致する市町村名がなかったら、ここで終わる
  if (cityNames.length === 0) {
    return [];
  }

  // 取得した「市町村名」でeventsテーブルを検索する
  const { data: eventsData, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .in("city", cityNames);

  if (eventsError) {
    console.error("イベント検索に失敗:", eventsError.message);
    return [];
  }

  return eventsData || [];
}

// ページ本体 (サーバーコンポーネント)
export default async function Page({ searchParams }) {
  // URLの「?codes=...」の部分 (searchParams) から市町村コードの文字列を取り出す
  const awaitedParams = await searchParams;
  const codesString = awaitedParams.codes || "";

  // カンマ区切りの文字列を、数値の配列に変換する
  const codesArray = codesString
    .split(",")
    .map(code => parseInt(code.trim(), 10))
    .filter(num => !isNaN(num));

  // 取得したコードの配列を使って、イベントを検索
  const events = await fetchEventsByCityCodes(codesArray);

  // タイトル用の文字列を作成
  const titleText =
    events.length > 0
      ? `場所の検索結果 (${events.length}件)`
      : `条件に一致するイベントは見つかりませんでした。`;
  // パンくずリスト用データを作成
  const crumbs = [
    { label: "場所から探す", href: "/search/location" },
    {
      label: "検索結果",
      href: `/search/location-results?codes=${codesString}`,
    }, // 最後のページ
  ];

  // クライアントコンポーネントにデータを渡す
  return (
    <Suspense fallback={<div>結果を読み込み中...</div>}>
      <CommonSearchResultsPage
        titleText={titleText}
        events={events}
        crumbs={crumbs}
        source="location"
        codes={codesString}
      />
    </Suspense>
  );
}
