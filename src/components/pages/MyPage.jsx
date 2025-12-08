"use client";

import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthPrompt from "@/components/auth/AuthPrompt";

// ==========================================
// Emotion Style Definitions (スタイル定義)
// ==========================================

// マイページ全体のラッパー
// ページの外枠としてパディングを設定しています
const MyPageWrapper = styled.div`
  padding: 24px;
`;

// ページタイトル (H1)
// 青い下線が付いた見出しスタイルです
const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #333;
  border-bottom: 3px solid #007bff;
  padding-bottom: 12px;
  margin-bottom: 24px;
`;

// プロフィール情報を表示する白いカード部分
// 枠線と角丸をつけて、情報をグループ化しています
const ProfileSection = styled.div`
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
`;

// プロフィールの各項目（名前、大学、学部など）
// ラベル部分(strong)の幅を固定して、揃えて表示します
const ProfileItem = styled.div`
  font-size: 16px;
  margin-bottom: 12px;
  strong {
    display: inline-block;
    width: 100px;
    font-weight: 500;
    color: #555;
  }
`;

// プロフィール編集ページへのリンクボタン
// 緑色(#28a745)をベースにしたLinkコンポーネントです
const EditButton = styled(Link)`
  display: inline-block;
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;
  margin-right: 16px; /* 右隣のボタンとの間隔 */
  transition: background-color 0.2s;

  &:hover {
    background-color: #218838;
  }
`;

// ★追加: 管理画面へのリンクボタン
// 管理者のみに表示されるボタン。目立つようにオレンジ色(#fd7e14)にしています
const AdminButton = styled(Link)`
  display: inline-block;
  background-color: #fd7e14;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;
  margin-right: 16px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e36d0d;
  }
`;

// ログアウトボタン
// 青色(#007bff)をベースにしたボタンです
const LogoutButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;

// 活動記録へのリンクボタン
const ActivityLogButton = styled(Link)`
  display: inline-block;
  background-color: #17a2b8;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;
  margin-right: 16px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #138496;
  }
`;

// マイリストへのリンクボタン（お気に入り）
// ピンク色(#e83e8c)をベースに
const FavoriteLinkButton = styled(Link)`
  display: inline-block;
  background-color: #e83e8c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;
  margin-right: 16px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #d63384;
  }
`;

// マイリストへのリンクボタン（応募済み）
// 緑色(#20c997)をベースに
const AppliedLinkButton = styled(Link)`
  display: inline-block;
  background-color: #20c997;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;
  margin-right: 16px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #198754;
  }
`;

// ==========================================
// コンポーネント本体
// ==========================================

/**
 * マイページ表示コンポーネント
 *
 * クライアントサイドで認証チェックとデータ取得を行います。
 * サーバーサイドでの取得によるクッキー読み込み漏れを防ぐため、
 * useEffectを使ってブラウザから直接データを取得する方式を採用しています。
 */
export default function MyPage() {
  const router = useRouter();

  // 状態管理 (State)
  const [profile, setProfile] = useState(null); // プロフィールデータ
  const [loading, setLoading] = useState(true); // 読み込み中かどうか
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ログインしているか

  /**
   * 初回レンダリング時に実行される処理
   * 1. ログインチェック
   * 2. プロフィールデータの取得 (ロール情報含む)
   */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // 1. 現在のユーザーを取得 (Supabaseに問い合わせ)
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        // ユーザーがいない、またはエラーの場合は未ログインとみなす
        if (userError || !user) {
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }

        // ユーザーがいればログイン済み
        setIsLoggedIn(true);

        // 2. プロフィールデータを取得
        // 関連する大学名(universities)と学部名(faculties)も結合して取得
        // ★ role (権限) カラムも取得して、管理者かどうか判定できるようにする
        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
            id,
            name,
            role,
            universities ( name ), 
            faculties ( name )
          `
          )
          .eq("id", user.id)
          .single(); // 1件だけ取得

        if (error) throw error;

        // 取得したデータを使いやすい形にセット
        setProfile({
          id: data.id,
          name: data.name,
          role: data.role, // 権限情報 (admin or user)
          university: data.universities?.name || "（未設定）",
          faculty: data.faculties?.name || "（未設定）",
        });
      } catch (error) {
        console.error("データ取得エラー:", error);
      } finally {
        // 成功・失敗に関わらずローディング終了
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // ローディング中の表示
  if (loading) {
    return (
      <MyPageWrapper>
        <p>読み込み中...</p>
      </MyPageWrapper>
    );
  }

  // ログインしていない場合は認証案内を表示
  if (!isLoggedIn) {
    return <AuthPrompt message="マイページを見るにはログインが必要です。" />;
  }

  /**
   * ログアウトボタンクリック時の処理
   * Supabaseからサインアウトし、ホームページへリダイレクトする
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/"; // 確実にクッキーを消すためフルリロードで移動
  };

  return (
    <MyPageWrapper>
      <Title>マイページ</Title>

      {/* プロフィール情報表示エリア */}
      <ProfileSection>
        <ProfileItem>
          <strong>名前:</strong>
          <span>{profile ? profile.name : "（未設定）"}</span>
        </ProfileItem>
        <ProfileItem>
          <strong>大学:</strong>
          <span>{profile ? profile.university : "（未設定）"}</span>
        </ProfileItem>
        <ProfileItem>
          <strong>学部:</strong>
          <span>{profile ? profile.faculty : "（未設定）"}</span>
        </ProfileItem>

        {/* 管理者の場合のみ権限を表示 (オプション) */}
        {profile?.role === "admin" && (
          <ProfileItem>
            <strong>権限:</strong>
            <span style={{ color: "#fd7e14", fontWeight: "bold" }}>管理者</span>
          </ProfileItem>
        )}
      </ProfileSection>

      <div style={{ marginTop: "24px" }}>
        {/* プロフィール編集ページへのリンク */}
        <EditButton href="/mypage/edit">プロフィールを編集</EditButton>

        {/* マイリストページへのリンクボタン */}
        <FavoriteLinkButton href="/mylist?tab=favorites">
          お気に入り一覧
        </FavoriteLinkButton>
        <AppliedLinkButton href="/mylist?tab=applied">
          応募済み一覧
        </AppliedLinkButton>

        {/* 活動記録ページへのリンク */}
        <ActivityLogButton href="/activity-log">
          活動記録を見る
        </ActivityLogButton>

        {/* ★追加: 管理者(admin)の場合のみ「管理画面へ」ボタンを表示 */}
        {profile?.role === "admin" && (
          <AdminButton href="/volunteer-registration/admin/events">
            管理画面へ
          </AdminButton>
        )}

        {/* ログアウトボタン */}
        <LogoutButton onClick={handleLogout}>ログアウト</LogoutButton>
      </div>
    </MyPageWrapper>
  );
}
