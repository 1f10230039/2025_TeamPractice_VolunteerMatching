import { supabase } from "@/lib/supabaseClient";
import EventDetailPage from "@/components/pages/EventDetailPage";

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
export default async function Page({ params }) {
  const { id } = await params;

  // Supabaseから、そのIDのイベント "1件だけ" を取得する
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id) // "id" カラムが params.id と一致する
    .single(); // 1件だけ取得

  // エラー処理
  if (error || !event) {
    console.error("イベント詳細の取得に失敗しました:", error?.message);
    return <div>イベントが見つかりませんでした。</div>;
  }

  // 取得した "1件" のデータを、クライアントコンポーネントに渡す
  return <EventDetailPage event={event} />;
}
