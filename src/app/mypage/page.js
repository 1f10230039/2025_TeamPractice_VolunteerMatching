// src/app/mypage/page.js

// サーバーコンポーネントが cookies() を使えるよう、動的レンダリングを強制
export const dynamic = "force-dynamic";

import MyPage from "@/components/pages/MyPage.jsx";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import AuthPrompt from "@/components/auth/AuthPrompt.jsx";
import { redirect } from "next/navigation"; // (現在は 'redirect' を使っていませんが、将来的に使う可能性もあるため残します)

/**
 * サーバー側で完全なプロフィールデータを取得する関数
 * (大学・学部名を含む)
 *
 * @param {object} supabase - サーバー専用のSupabaseクライアント
 * @param {string} userId - 取得対象のユーザーID
 * @returns {object | null} 整形済みプロフィールデータ
 */
async function getFullProfile(supabase, userId) {
  try {
    // RLS (profiles.id = auth.uid()) が設定されているため、
    // 認証済みユーザーID (userId) と一致する行のみが返される

    // profilesテーブルを起点に、
    // 関連する universities と faculties の name を
    // 外部キー結合(join)して一度に取得する
    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        name,
        universities ( name ), 
        faculties ( name )
      `
      )
      .eq("id", userId)
      .single(); // データを1件だけ取得 (0件または複数件ならエラー)

    if (error) {
      // .single() が0件の行を見つけた場合、ここでエラー (PGRST116) が発生
      throw error;
    }

    if (!profile) {
      return null; // (理論上 .single() がエラーを投げるため、ここは通過しない)
    }

    // 取得したデータを使いやすい形に整形する
    // { id: '...', name: '...', universities: { name: '〇〇大学' }, ... }
    // 　↓
    // { id: '...', name: '...', university: '〇〇大学', faculty: '〇〇学部' }
    const formattedProfile = {
      id: profile.id,
      name: profile.name,
      university: profile.universities?.name || "（未設定）",
      faculty: profile.faculties?.name || "（未設定）",
    };

    return formattedProfile;
  } catch (error) {
    // getFullProfile でのエラーは、大抵 .single() が0件だった場合
    console.error("プロフィール取得エラー (getFullProfile):", error.message);
    return null;
  }
}

/**
 * マイページの本体（サーバーコンポーネント）
 *
 * 認証状態をサーバー側でチェックし、
 * ログインしていればプロフィールを表示、
 * していなければ認証案内 (AuthPrompt) を表示する
 */
export default async function MyPageContainer() {
  // サーバー専用クライアントを呼び出す
  const supabase = createSupabaseServerClient();

  // サーバー側で認証済みユーザーを Supabase に問い合わせて取得
  // (クッキーを読むだけの getSession() ではなく、 getUser() が推奨される)
  const {
    data: { user }, // 'session' ではなく 'user' オブジェクトを取得
    error: userError,
  } = await supabase.auth.getUser();

  // 1. ユーザーがいない (ログインしていない) 場合
  // (userError があるか、user が null の場合)
  if (userError || !user) {
    // ログイン・サインアップを促す専用コンポーネントを表示する
    return <AuthPrompt />;
  }

  // 2. ユーザーがいる (ログインしている) 場合
  // 認証済みの 'user.id' を使って、DBから完全なプロフィール情報を取得
  const profile = await getFullProfile(supabase, user.id);

  if (!profile) {
    // getFullProfile が null を返した場合
    // (サインアップ時に profiles へ insert が失敗している、など)
    console.error(
      `ログインしているが、プロフィールが見つかりません。 (user.id: ${user.id})`
    );
    // ユーザーにエラーを通知
    return <AuthPrompt message="プロフィールの取得に失敗しました。" />;
  }

  // 3. 正常にプロフィールが取得できた場合
  // クライアントコンポーネント(MyPage.jsx)に
  // 取得した「本物の」データをpropsとして渡す
  return <MyPage profile={profile} />;
}
