"use client";

import styled from "@emotion/styled";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

// マイページ全体のラッパー
const MyPageWrapper = styled.div`
  padding: 24px;
`;

// H1見出し
const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #333;
  /* MyListPageのアクティブタブのアクセントカラーと合わせる */
  border-bottom: 3px solid #007bff;
  padding-bottom: 12px;
  margin-bottom: 24px;
`;

// プロフィール情報セクション
const ProfileSection = styled.div`
  background-color: #ffffff;
  border: 1px solid #e0e0e0; /* 少し薄いボーダー */
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px; /* ボタンとの間隔 */
`;

// プロフィールの各項目（「名前: 〇〇」など）
const ProfileItem = styled.div`
  font-size: 16px;
  margin-bottom: 12px;

  strong {
    display: inline-block;
    width: 100px; /* ラベルの幅を固定して見やすくする */
    font-weight: 500;
    color: #555;
  }
`;

// ログアウトボタン
const LogoutButton = styled.button`
  background-color: #007bff; /* キーカラーに変更 */
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3; /* ホバー色も調整 */
  }
`;

/**
 * マイページ表示コンポーネント
 * @param {{ profile: object | null }} props
 */
export default function MyPage({ profile }) {
  const router = useRouter();

  /**
   * ログアウトボタンクリック時の処理
   */
  const handleLogout = async () => {
    // supabase クライアントの signOut() 関数を呼び出す
    const { error } = await supabase.auth.signOut();

    if (error) {
      // もしログアウト処理でエラーが起きたら
      console.error("ログアウトエラー:", error);
      alert("ログアウトに失敗しました。");
    } else {
      // エラーがなければ、クッキーを確実にクリアするために
      //    フルリロードでホームページに遷移する
      window.location.href = "/login";
    }
  };

  return (
    <MyPageWrapper>
      <Title>マイページ</Title>

      {/* プロフィール情報をカードで囲む */}
      <ProfileSection>
        <ProfileItem>
          <strong>名前:</strong>
          {/* profileがnull（データ取得失敗など）の場合も考慮 */}
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
