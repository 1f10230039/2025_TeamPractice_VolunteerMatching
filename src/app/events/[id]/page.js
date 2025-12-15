import { supabase } from "@/lib/supabaseClient";
import EventDetailPage from "@/components/pages/EventDetailPage";
import { Suspense } from "react";

// SEO用のメタデータ生成
export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data: event } = await supabase
    .from("events")
    .select("name, short_description")
    .eq("id", id)
    .single();

  if (!event) {
    return {
      title: "スポットが見つかりません | ボランティアマッチング",
    };
  }

  return {
    title: `${event.name} | ボランティアマッチング`,
    description: event.short_description || "詳細な情報はありません",
  };
}

/**
 * イベント詳細ページ (サーバーコンポーネント)
 */
export default async function Page({ params, searchParams }) {
  const { id } = await params;

  const awaitedSearchParams = await searchParams;
  const source = awaitedSearchParams?.source;
  const q = awaitedSearchParams.q;
  const codes = awaitedSearchParams.codes;

  // 1. Supabaseからデータを取得 (タグ情報と追加画像も結合！)
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

  if (error || !rawEvent) {
    console.error("イベント詳細の取得に失敗しました:", error?.message);
    return <div>イベントが見つかりませんでした。</div>;
  }

  // 2. データを整形する (トップページと同じロジック)
  // ネストされた event_tags -> tags を、フラットな tags 配列に変換
  const tags = rawEvent.event_tags
    ? rawEvent.event_tags.map(item => item.tags).filter(tag => tag !== null)
    : [];

  // 整形したデータを作成
  const event = {
    ...rawEvent,
    tags: tags, // ここに整形したタグ配列を入れる
  };

  // 3. クライアントコンポーネントに渡す
  return (
    <Suspense fallback={<div>記録を読み込み中...</div>}>
      <EventDetailPage event={event} source={source} q={q} codes={codes} />
    </Suspense>
  );
}
