"use client";

import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthPrompt from "@/components/auth/AuthPrompt";

// Emotion Style Definitions
// マイページ全体のラッパー
const MyPageWrapper = styled.div`
  padding: 24px;
`;

// ページタイトル
const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #333;
  border-bottom: 3px solid #007bff;
  padding-bottom: 12px;
  margin-bottom: 24px;
`;

// プロフィール情報を表示する白いカード部分
const ProfileSection = styled.div`
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
`;

// プロフィールの各項目（名前、大学、学部）
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
const EditButton = styled(Link)`
  display: inline-block;
  background-color: #28a745; /* 緑色 */
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
    background-color: #218838;
  }
`;

// ログアウトボタン
const LogoutButton = styled.button`
  background-color: #007bff; /* 青色 */
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
   * 2. プロフィールデータの取得
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
        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
            id,
            name,
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
      </ProfileSection>

      <div style={{ marginTop: "24px" }}>
        {/* プロフィール編集ページへのリンク */}
        <EditButton href="/mypage/edit">プロフィールを編集</EditButton>
        <LogoutButton onClick={handleLogout}>ログアウト</LogoutButton>
      </div>
    </MyPageWrapper>
  );
}
