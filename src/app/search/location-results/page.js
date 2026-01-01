import { supabase } from "@/lib/supabaseClient";
import CommonSearchResultsPage from "@/components/pages/CommonSearchResultsPage";
import { Suspense } from "react";

// --- 検索ロジック ---
async function fetchEventsByLocation(prefCodes, cityCodes) {
  // 1. 何も指定がなければ空を返す
  if (prefCodes.length === 0 && cityCodes.length === 0) {
    return [];
  }

  // 検索条件となる「名前リスト」を作る
  let targetPrefNames = [];
  let targetCityNames = [];

  // 2. 都道府県コードを「名前」に変換 (例: 13 -> "東京都")
  if (prefCodes.length > 0) {
    const { data: prefs, error } = await supabase
      .from("prefectures")
      .select("name")
      .in("prefecture-code", prefCodes);

    if (!error && prefs) {
      targetPrefNames = prefs.map(p => p.name);
    }
  }

  // 3. 市町村コードを「名前」に変換 (例: 13101 -> "千代田区")
  if (cityCodes.length > 0) {
    const { data: cities, error } = await supabase
      .from("cities")
      .select("name")
      .in("city-code", cityCodes);

    if (!error && cities) {
      targetCityNames = cities.map(c => c.name);
    }
  }

  // 名前が一つも取れなかったら終了
  if (targetPrefNames.length === 0 && targetCityNames.length === 0) {
    return [];
  }

  // 4. イベント検索 (eventsテーブル)
  let query = supabase.from("events").select(`
      *,
      event_tags ( tags ( * ) )
    `);

  // OR条件の組み立て: 「都道府県名が一致」または「市町村名が一致」
  const conditions = [];

  if (targetPrefNames.length > 0) {
    const prefString = targetPrefNames.map(n => `"${n}"`).join(",");
    conditions.push(`prefectures.in.(${prefString})`);
  }

  if (targetCityNames.length > 0) {
    // cityカラム IN ("千代田区", "柏市")
    const cityString = targetCityNames.map(n => `"${n}"`).join(",");
    conditions.push(`city.in.(${cityString})`);
  }

  if (conditions.length > 0) {
    // or(条件1,条件2) の形にする
    query = query.or(conditions.join(","));
  }

  const { data: eventsData, error: eventsError } = await query;

  if (eventsError) {
    console.error("イベント検索エラー:", eventsError.message);
    return [];
  }

  // 整形
  return (eventsData || []).map(event => ({
    ...event,
    tags: event.event_tags
      ? event.event_tags.map(item => item.tags).filter(t => t)
      : [],
  }));
}

// --- Page Component ---
export default async function Page({ searchParams }) {
  const awaitedParams = await searchParams;

  // URLパラメータの解析 (?prefs=13,14&cities=13101)
  const parseCodes = str =>
    str
      ? str
          .split(",")
          .map(c => parseInt(c.trim(), 10))
          .filter(n => !isNaN(n))
      : [];

  const prefCodes = parseCodes(awaitedParams.prefs);
  const cityCodes = parseCodes(awaitedParams.cities);

  // データ取得
  const events = await fetchEventsByLocation(prefCodes, cityCodes);

  // タイトル作成
  const count = events.length;
  const titleText =
    count > 0
      ? `場所の検索結果 (${count}件)`
      : "条件に一致するイベントは見つかりませんでした";

  // パンくず
  const crumbs = [
    { label: "場所から探す", href: "/search/location" },
    { label: "検索結果", href: "#" },
  ];

  return (
    <Suspense
      fallback={
        <div style={{ padding: "40px", textAlign: "center" }}>検索中...</div>
      }
    >
      <CommonSearchResultsPage
        titleText={titleText}
        events={events}
        crumbs={crumbs}
        source="location"
      />
    </Suspense>
  );
}
