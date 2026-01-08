//　場所検索の結果ページコンポーネント
import { supabase } from "@/lib/supabaseClient";
import CommonSearchResultsPage from "@/components/pages/CommonSearchResultsPage";
import { Suspense } from "react";

// 指定された都道府県コード・市町村コードに基づいてイベントを取得する関数
async function fetchEventsByLocation(prefCodes, cityCodes) {
  // もし何も指定がなければ空を返す
  if (prefCodes.length === 0 && cityCodes.length === 0) {
    // 早期リターン
    return [];
  }

  // コードから名前への変換準備
  // 都道府県名リスト
  let targetPrefNames = [];
  // 市町村名リスト
  let targetCityNames = [];

  // もしコードが指定されていれば名前を取得する
  if (prefCodes.length > 0) {
    // Supabaseから都道府県名を取得
    const { data: prefs, error } = await supabase
      .from("prefectures") // 都道府県テーブル
      .select("name") // 名前カラムだけ取得
      .in("prefecture-code", prefCodes); // 指定されたコードに一致するもの

    //もしエラーがなければ名前リストを作成
    if (!error && prefs) {
      targetPrefNames = prefs.map(p => p.name);
    }
  }

  // もしコードが指定されていれば名前を取得する
  if (cityCodes.length > 0) {
    // Supabaseから市町村名を取得
    const { data: cities, error } = await supabase
      .from("cities") // 市町村テーブル
      .select("name") // 名前カラムだけ取得
      .in("city-code", cityCodes); // 指定されたコードに一致するもの

    //もしエラーがなければ名前リストを作成
    if (!error && cities) {
      targetCityNames = cities.map(c => c.name);
    }
  }

  // 名前が一つも取れなかったら終了
  if (targetPrefNames.length === 0 && targetCityNames.length === 0) {
    // 早期リターン
    return [];
  }

  // イベント検索クエリの組み立て
  // 基本クエリ
  let query = supabase.from("events").select(`
      *,
      event_tags ( tags ( * ) )
    `);

  // 条件の組み立て
  const conditions = [];

  //　もし都道府県名があれば条件に追加
  if (targetPrefNames.length > 0) {
    // prefecturesカラム IN ("東京都", "千葉県")
    const prefString = targetPrefNames.map(n => `"${n}"`).join(",");
    conditions.push(`prefectures.in.(${prefString})`);
  }

  // もし市町村名があれば条件に追加
  if (targetCityNames.length > 0) {
    // cityカラム IN ("千代田区", "柏市")
    const cityString = targetCityNames.map(n => `"${n}"`).join(",");
    conditions.push(`city.in.(${cityString})`);
  }

  // もし条件が一つでもあればクエリに追加
  if (conditions.length > 0) {
    // or(条件1,条件2) の形にする
    query = query.or(conditions.join(","));
  }

  // クエリ実行
  const { data: eventsData, error: eventsError } = await query;

  // もしエラーが発生したらログに出して空配列を返す
  if (eventsError) {
    console.error("イベント検索エラー:", eventsError.message);
    // エラー時は空配列を返す
    return [];
  }

  // タグ情報を整形して返す
  return (eventsData || []).map(event => ({
    ...event,
    tags: event.event_tags
      ? event.event_tags.map(item => item.tags).filter(t => t)
      : [],
  }));
}

// ページ本体
// クライアントコンポーネントにデータを渡す
export default async function Page({ searchParams }) {
  // URLの検索パラメータを取得
  const awaitedParams = await searchParams;

  // URLパラメータの解析 (?prefs=13,14&cities=13101)
  const parseCodes = str =>
    str
      ? str
          .split(",")
          .map(c => parseInt(c.trim(), 10))
          .filter(n => !isNaN(n))
      : [];

  // 都道府県コードの配列を取得
  const prefCodes = parseCodes(awaitedParams.prefs);
  // 市町村コードの配列を取得
  const cityCodes = parseCodes(awaitedParams.cities);
  // データ取得
  const events = await fetchEventsByLocation(prefCodes, cityCodes);
  // イベント数を取得
  const count = events.length;
  // タイトル文字列を作成
  const titleText =
    count > 0
      ? `場所の検索結果 (${count}件)`
      : "条件に一致するイベントは見つかりませんでした";

  // パンくず
  const crumbs = [
    { label: "場所から探す", href: "/search/location" },
    { label: "検索結果", href: "#" },
  ];

  // クライアントコンポーネントにデータを渡す
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
