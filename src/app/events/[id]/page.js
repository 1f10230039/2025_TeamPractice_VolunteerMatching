import { supabase } from "@/lib/supabaseClient";
import EventDetailPage from "@/components/pages/EventDetailPage";
import { Suspense } from "react";

/**
 * ページの内容に応じて、メタデータを動的に生成する関数
 * @param {object} props
 * @param {Promise<object>} props.params - URLの動的な部分を含むPromiseライクなオブジェクト
 * @returns {Promise<object>} Next.jsが使用するメタデータオブジェクト
 */
export async function generateMetadata({ params }) {
  const { id } = await params;

  // SEOに必要なデータ（名前と説明文）だけを先に取得
  const { data: event } = await supabase
    .from("events")
    .select("name, short_description")
    .eq("id", id)
    .single();

  // もしスポットが見つからなかった場合のデフォルトタイトル
  if (!event) {
    return {
      title: "スポットが見つかりません | ボランティアマッチング",
    };
  }

  // 見つかったスポットの名前と説明をメタデータとして設定
  return {
    title: `${event.name} | ボランティアマッチング`,
    description: event.short_description || "詳細な情報はありません",
  };
}

/**
 * イベント詳細ページを生成するサーバーコンポーネント
 * @param {object} props - コンポーネントのプロパティ
 * @param {Promise<object>} props.params - URLから渡されるパラメータ ({ id: '...' })
 */
export default async function Page({ params, searchParams }) {
  const { id } = await params;

  const awaitedSearchParams = await searchParams;
  const source = awaitedSearchParams?.source; // "mylist" か "undefined" が入る
  const q = awaitedSearchParams.q; // キーワード (例: "子供")
  const codes = awaitedSearchParams.codes; // 場所コード (例: "123,456")

  // Supabaseから、そのIDのイベント "1件だけ" を取得する
  const { data: event, error } = await supabase
    .from("events")
    .select(
      `
      *,
      event_images (
        image_url
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !event) {
    console.error("イベント詳細の取得に失敗しました:", error?.message);
    return <div>イベントが見つかりませんでした。</div>;
  }

  // イベントデータが正常に取得できた場合、詳細ページコンポーネントをレンダリング
  return (
    <Suspense fallback={<div>記録を読み込み中...</div>}>
      <EventDetailPage event={event} source={source} q={q} codes={codes} />
    </Suspense>
  );
}
