// サインアップページ

// ページを静的（ビルド時）ではなく動的（リクエスト時）にレンダリングするよう強制
// これにより 'cookies()' 関数などがサーバーコンテキストで正しく動作します
export const dynamic = "force-dynamic";

// クライアント用(supabaseClient)ではなく、サーバー用(supabaseServer)クライアントをインポート
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import SignupPage from "@/components/pages/SignupPage.jsx";

/**
 * サーバー側で大学リストを取得する関数
 */
async function getUniversities() {
  // サーバー専用クライアントのインスタンスを作成
  const supabase = createSupabaseServerClient();

  try {
    // supabaseから 'universities' テーブルの 'id' と 'name' を全件取得
    // ※RLSポリシーで 'universities' は 'public' (全員) に
    //   'SELECT' (読み取り) を許可 (USING true) している必要があります
    const { data: universities, error } = await supabase
      .from("universities")
      .select("id, name");

    if (error) {
      throw error; // エラーが発生した場合はキャッチに投げる
    }

    return universities; // 取得した大学リスト（配列）を返す
  } catch (error) {
    console.error("大学リストの取得に失敗:", error);
    return []; // エラーの場合は空配列を返す
  }
}

/**
 * サインアップページの本体（サーバーコンポーネント）
 * サーバー側で大学リストを取得し、クライアントコンポーネントに渡す
 */
export default async function SignupPageContainer() {
  // サーバー側で非同期に大学リストを取得
  const universities = await getUniversities();

  // クライアントコンポーネント(SignupPage.jsx)を呼び出し、
  // propsとして 'initialUniversities' という名前で大学リストを渡す
  return <SignupPage initialUniversities={universities} />;
}
