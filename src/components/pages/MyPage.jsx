"use client";

import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { supabase } from "@/lib/supabaseClient";
import {
  FaUserCircle,
  FaUniversity,
  FaGraduationCap,
  FaPen,
  FaSignOutAlt,
  FaHeart,
  FaCheckCircle,
  FaBookOpen,
  FaTools,
} from "react-icons/fa";
import AuthPrompt from "@/components/auth/AuthPrompt";

// ==========================================
// Emotion Style Definitions
// ==========================================

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: #f5fafc; /* ベース背景色 */
  padding: 40px 20px;
  font-family: "Helvetica Neue", Arial, sans-serif;
  @media (max-width: 600px) {
    margin-bottom: 80px;
  }
`;

const ContentContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const LogoutButton = styled.button`
  background: white;
  border: 2px solid #eee;
  border-radius: 30px;
  padding: 8px 16px;
  color: #888;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  max-width: 150px;

  &:hover {
    border-color: #ff6b6b;
    color: #ff6b6b;
    background-color: #fff0f0;
    transform: translateY(-1px);
  }
`;

// --- プロフィールカード ---
const ProfileCard = styled.div`
  background-color: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(122, 211, 232, 0.15);
  position: relative;
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 40px;

  @media (max-width: 600px) {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }
`;

// AvatarIcon スタイル
const AvatarIcon = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background-color: #f0f8ff;
  border: 4px solid #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

  /* アイコンの場合のスタイル */
  font-size: 80px;
  color: #a0c4ff;
`;

// Avatar画像用スタイル（将来の拡張用）
const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ProfileInfo = styled.div`
  flex-grow: 1;
`;

const UserName = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0 0 12px 0;
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 16px;
  color: #666;
  font-size: 15px;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    justify-content: center;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  & svg {
    color: #68b5d5;
  }
`;

const EditProfileButton = styled.a`
  position: absolute;
  top: 24px;
  right: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f0f4f8;
  color: #5796c2;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    background-color: #e1eaf5;
    transform: scale(1.1);
    color: #4a90e2;
  }

  @media (max-width: 600px) {
    position: static;
    margin-top: 16px;
    width: auto;
    border-radius: 20px;
    padding: 8px 20px;
    font-weight: bold;
    font-size: 14px;
    gap: 8px;
  }
`;

// --- ダッシュボードグリッド (メニューボタン) ---
const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 40px;
`;

// 共通のカードボタンスタイル
const MenuCard = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  border-radius: 20px; /* 角丸を少し強く */
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  ${props =>
    props.variant === "outline"
      ? `
    /* Outline Style (応募済み・お気に入り) */
    background-color: #FFFFFF;
    border: 2px solid #4A90E2;
    color: #4A90E2;
    box-shadow: 0 4px 10px rgba(74, 144, 226, 0.1);

    &:hover {
      background-color: #F0F8FF; /* AliceBlue */
      border-color: #357ABD; /* 濃い青 */
      color: #357ABD;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(74, 144, 226, 0.15);
    }

    &:active {
      transform: translateY(0);
      background-color: #E6F2FF;
      box-shadow: none;
    }
    
    /* アイコンの色も継承させる */
    & > div {
        color: inherit;
        filter: none;
    }
  `
      : `
    /* Gradient Style (活動記録 - デフォルト) */
    background-color: #FFFFFF;
    border: 2px solid #4A90E2;
    color: #4A90E2;
    box-shadow: 0 4px 10px rgba(74, 144, 226, 0.1);

    &:hover {
      background-color: #F0F8FF; /* AliceBlue */
      border-color: #357ABD; /* 濃い青 */
      color: #357ABD;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(74, 144, 226, 0.15);
    }

    &:active {
      transform: translateY(0);
      background-color: #E6F2FF;
      box-shadow: none;
    }
    
    /* アイコンの色も継承させる */
    & > div {
        color: inherit;
        filter: none;
    }
  `}
`;

const MenuIcon = styled.div`
  font-size: 36px;
  margin-bottom: 12px;
  color: ${props => props.iconColor || "inherit"};
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
`;

const MenuLabel = styled.span`
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  ${props =>
    props.variant === "outline" &&
    `
    text-shadow: none;
  `}
`;

const MenuDesc = styled.span`
  font-size: 13px;
  opacity: 0.9;
  margin-top: 6px;
  font-weight: 500;
`;

// 管理者エリア
const AdminSection = styled.div`
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px dashed #ccc;
  text-align: center;
`;

const AdminLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background-color: #343a40;
  color: white;
  border-radius: 30px;
  font-size: 14px;
  font-weight: bold;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #495057;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const LogoutSection = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 40px;
`;

// ==========================================
// コンポーネント本体
// ==========================================

export default function MyPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }

        setIsLoggedIn(true);

        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
            id,
            name,
            role,
            avatar_url,
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
          role: data.role,
          avatarUrl: data.avatar_url,
          university: data.universities?.name || "未設定",
          faculty: data.faculties?.name || "未設定",
        });
      } catch (error) {
        console.error("データ取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    if (confirm("ログアウトしますか？")) {
      await supabase.auth.signOut();
      window.location.href = "/";
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <ContentContainer
          style={{ textAlign: "center", color: "#888", paddingTop: "100px" }}
        >
          <p>読み込み中...</p>
        </ContentContainer>
      </PageWrapper>
    );
  }

  if (!isLoggedIn) {
    return <AuthPrompt message="マイページを見るにはログインが必要です。" />;
  }

  return (
    <PageWrapper>
      <ContentContainer>
        {/* プロフィールカード */}
        <ProfileSection>
          <ProfileCard>
            <AvatarIcon>
              {profile?.avatarUrl ? (
                // 画像がある場合は画像を表示
                <AvatarImg src={profile.avatarUrl} alt={profile.name} />
              ) : (
                // ない場合はアイコンを表示
                <FaUserCircle />
              )}
            </AvatarIcon>
            <ProfileInfo>
              <UserName>{profile ? profile.name : "ゲストユーザー"}</UserName>
              <MetaInfo>
                <MetaItem>
                  <FaUniversity />
                  {profile ? profile.university : "大学未設定"}
                </MetaItem>
                <MetaItem>
                  <FaGraduationCap />
                  {profile ? profile.faculty : "学部未設定"}
                </MetaItem>
              </MetaInfo>
            </ProfileInfo>

            {/* 編集ボタン */}
            <EditProfileButton
              href="/mypage/edit"
              aria-label="プロフィール編集"
            >
              <FaPen size={16} />
              {/* スマホ表示用テキスト */}
              <span className="mobile-text" style={{ display: "none" }}>
                編集
              </span>
            </EditProfileButton>
          </ProfileCard>
        </ProfileSection>

        {/* メインメニュー（ダッシュボード） */}
        <DashboardGrid>
          {/* 活動記録 */}
          <MenuCard
            href="/activity-log"
            bg="linear-gradient(135deg, #68B5D5 0%, #4A90E2 100%)"
            shadowColor="rgba(74, 144, 226, 0.3)"
            style={{ gridColumn: "1 / -1" }} // 横幅いっぱいに
          >
            <MenuIcon>
              <FaBookOpen />
            </MenuIcon>
            <MenuLabel>活動記録を見る</MenuLabel>
            <MenuDesc>あなたのボランティアの軌跡を確認できます</MenuDesc>
          </MenuCard>

          {/* 2. 応募済み */}
          <MenuCard href="/mylist?tab=applied" variant="outline">
            <MenuIcon>
              <FaCheckCircle />
            </MenuIcon>
            <MenuLabel variant="outline">応募済み</MenuLabel>
            <MenuDesc>応募済みのボランティアを確認できます</MenuDesc>
          </MenuCard>

          {/* 3. お気に入り */}
          <MenuCard href="/mylist?tab=favorites" variant="outline">
            <MenuIcon>
              <FaHeart />
            </MenuIcon>
            <MenuLabel variant="outline">お気に入り</MenuLabel>
            <MenuDesc>気になっているボランティアを確認できます</MenuDesc>
          </MenuCard>
        </DashboardGrid>

        {/* ログアウトボタン */}
        <LogoutSection>
          <LogoutButton onClick={handleLogout}>
            <FaSignOutAlt /> ログアウト
          </LogoutButton>
        </LogoutSection>

        {/* 管理者メニュー */}
        {profile?.role === "admin" && (
          <AdminSection>
            <p style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
              管理者メニュー
            </p>
            <AdminLink href="/volunteer-registration/admin/events">
              <FaTools /> ボランティア管理画面へ
            </AdminLink>
          </AdminSection>
        )}
      </ContentContainer>
    </PageWrapper>
  );
}

const ProfileSection = styled.section`
  /* 必要に応じてアニメーションなどを追加 */
`;
