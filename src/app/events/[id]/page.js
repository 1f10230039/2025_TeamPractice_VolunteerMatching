// イベント詳細ページ (サーバーコンポーネント)
import { supabase } from "@/lib/supabaseClient";
import EventDetailPage from "@/components/pages/EventDetailPage";
import { Suspense } from "react";

// SEO用のメタデータ生成
export async function generateMetadata({ params }) {
  // パラメータからIDを取得
  const { id } = await params;
  // Supabaseからイベントデータを取得
  const { data: event } = await supabase
    .from("events")
    .select("name, short_description")
    .eq("id", id)
    .single();

  // イベントが見つからない場合のデフォルトメタデータ
  if (!event) {
    // スポットが見つからない場合のメタデータを返す
    return {
      title: "スポットが見つかりません | ボランティアマッチング",
    };
  }

  // イベントに基づくメタデータを返す
  return {
    title: `${event.name} | ボランティアマッチング`,
    description: event.short_description || "詳細な情報はありません",
  };
}

/**
 * イベント詳細ページ (サーバーコンポーネント)
 */
export default async function Page({ params, searchParams }) {
  // パラメータからIDを取得
  const { id } = await params;
  // 検索パラメータを取得
  const awaitedSearchParams = await searchParams;
  // 検索パラメータを取得
  const source = awaitedSearchParams?.source;
  // 検索パラメータを取得
  const q = awaitedSearchParams.q;
  // 検索パラメータを取得
  const codes = awaitedSearchParams.codes;

  // Supabaseからデータを取得
  const { data: rawEvent, error } = await supabase
    .from("events")
    .select(
      `
      *,
      event_images (
        image_url
      ),
      event_tags (
        tags (
          *
        )
      )
    `
    )
    .eq("id", id)
    .single();

  // イベントデータの取得に失敗した場合の処理
  if (error || !rawEvent) {
    console.error("イベント詳細の取得に失敗しました:", error?.message);
    // エラーメッセージを表示するか、404ページにリダイレクトするなどの処理を行う
    return <div>イベントが見つかりませんでした。</div>;
  }

  // データを整形する
  // ネストされた event_tags -> tags を、フラットな tags 配列に変換
  const tags = rawEvent.event_tags
    ? rawEvent.event_tags.map(item => item.tags).filter(tag => tag !== null)
    : [];

  // 整形したデータを作成
  const event = {
    ...rawEvent,
    tags: tags, // ここに整形したタグ配列を入れる
  };

  // Suspenseでラップしてコンテナを表示
  return (
    <Suspense fallback={<div>記録を読み込み中...</div>}>
      <EventDetailPage event={event} source={source} q={q} codes={codes} />
    </Suspense>
  );
}
