import { supabase } from "@/lib/supabaseClient";
import HomePage from "@/components/pages/HomePage";

export default async function Page() {
  // Supabaseからデータを取得する
  const { data: events, error } = await supabase.from("events").select("*");

  // データ取得中にエラーが発生したら、エラーページを表示する
  if (error) {
    console.error("イベントデータの取得に失敗しました:", error.message);
    // 本番環境ではもっと丁寧なエラーページを作成する
    return <div>データの取得に失敗しました。</div>;
  }

  // データがなければ空の配列を渡す
  const safeEvents = events || [];

  return (
    // 取得したイベントデータを、クライアントコンポーネントにpropsとして渡す
    <HomePage events={safeEvents} />
  );
}
