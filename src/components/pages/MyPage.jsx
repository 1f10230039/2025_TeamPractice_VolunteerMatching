"use client";

import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
// ★ 追加: 未ログイン時の案内コンポーネントをインポート
import AuthPrompt from "@/components/auth/AuthPrompt";

// --- Emotion スタイル定義 ---
const MyPageWrapper = styled.div`
  padding: 24px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #333;
  border-bottom: 3px solid #007bff;
  padding-bottom: 12px;
  margin-bottom: 24px;
`;

const ProfileSection = styled.div`
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
`;

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

// --- コンポーネント本体 ---

export default function MyPage() {
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  // ★ 追加: ログインしているかどうかのフラグ
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // ★★★ 追加: Supabaseがユーザーをどう認識しているか確認 ★★★
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        console.log("🕵️‍♂️ MyPage Client Check:");
        console.log("   - User:", user);
        console.log("   - Error:", userError);

        if (userError || !user) {
          // ★ 変更点: ここで router.push("/login") をしない！
          // 単に「ログインしていない」として処理を終える
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }

        // ユーザーがいればログイン済み
        setIsLoggedIn(true);

        // 2. プロフィールデータを取得
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
          .single();

        if (error) throw error;

        setProfile({
          id: data.id,
          name: data.name,
          university: data.universities?.name || "（未設定）",
          faculty: data.faculties?.name || "（未設定）",
        });
      } catch (error) {
        console.error("データ取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // ローディング中
  if (loading) {
    return (
      <MyPageWrapper>
        <p>読み込み中...</p>
      </MyPageWrapper>
    );
  }

  // ★ 追加: ログインしていない場合、AuthPromptを表示する
  if (!isLoggedIn) {
    return <AuthPrompt message="マイページを見るにはログインが必要です。" />;
  }

  // ログアウト処理
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/mypage";
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

      <LogoutButton onClick={handleLogout}>ログアウト</LogoutButton>
    </MyPageWrapper>
  );
}
