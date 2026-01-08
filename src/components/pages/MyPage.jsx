// マイページコンポーネント
"use client";

import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { supabase } from "@/lib/supabaseClient";
import {
  FaSignOutAlt,
  FaHeart,
  FaCheckCircle,
  FaBookOpen,
  FaTools,
} from "react-icons/fa";
import AuthPrompt from "@/components/auth/AuthPrompt";
import ProfileCard from "@/components/mypage/ProfileCard";
import RankModal from "@/components/mypage/RankModal";

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: #f5fafc;
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

// --- ダッシュボードグリッド ---
const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 40px;
`;

const MenuCard = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  border-radius: 20px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  background-color: #ffffff;
  border: 2px solid
    ${props => (props.variant === "outline" ? "#4A90E2" : "transparent")};
  color: #4a90e2;
  box-shadow: 0 4px 10px rgba(74, 144, 226, 0.1);

  ${props =>
    props.bg &&
    `
    background: ${props.bg};
    color: white;
    border: none;
    box-shadow: 0 6px 15px rgba(74, 144, 226, 0.3);
  `}

  &:hover {
    transform: translateY(-2px);
    filter: brightness(1.05);
    ${props =>
      props.variant === "outline" &&
      `
        background-color: #F0F8FF;
        border-color: #357ABD;
        color: #357ABD;
    `}
  }

  &:active {
    transform: translateY(0);
  }
`;

const MenuIcon = styled.div`
  font-size: 36px;
  margin-bottom: 12px;
  color: inherit;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
`;

const MenuLabel = styled.span`
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.5px;
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

export default function MyPage() {
  const [profile, setProfile] = useState(null);
  const [applicationCount, setApplicationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
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

        // 1. プロフィール取得
        const profilePromise = supabase
          .from("profiles")
          .select(
            `
            id, name, role, avatar_url,
            universities ( name ), 
            faculties ( name )
          `
          )
          .eq("id", user.id)
          .single();

        // 2. 応募済み件数の取得 (applicationsテーブルのカウント)
        // { count: 'exact', head: true } でデータの中身は取らず件数だけ取る
        const countPromise = supabase
          .from("applications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // 並列実行
        const [profileRes, countRes] = await Promise.all([
          profilePromise,
          countPromise,
        ]);

        if (profileRes.error) throw profileRes.error;

        const data = profileRes.data;
        setProfile({
          id: data.id,
          name: data.name,
          role: data.role,
          avatarUrl: data.avatar_url,
          university: data.universities?.name || "大学未設定",
          faculty: data.faculties?.name || "学部未設定",
        });

        // 件数をセット (エラーまたは0件の場合は0)
        setApplicationCount(countRes.count || 0);
      } catch (error) {
        console.error("データ取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        <ProfileCard
          profile={profile}
          applicationCount={applicationCount}
          onOpenRankModal={() => setIsRankModalOpen(true)}
        />

        {/* メインメニュー */}
        <DashboardGrid>
          {/* 活動記録 */}
          <MenuCard
            href="/activity-log"
            variant="outline"
            style={{ gridColumn: "1 / -1" }}
          >
            <MenuIcon>
              <FaBookOpen />
            </MenuIcon>
            <MenuLabel>活動記録を見る</MenuLabel>
            <MenuDesc>あなたのボランティアの軌跡を確認できます</MenuDesc>
          </MenuCard>

          {/* 応募済み */}
          <MenuCard href="/mylist?tab=applied" variant="outline">
            <MenuIcon>
              <FaCheckCircle />
            </MenuIcon>
            <MenuLabel>応募済み</MenuLabel>
            <MenuDesc>現在の応募状況</MenuDesc>
          </MenuCard>

          {/* お気に入り */}
          <MenuCard href="/mylist?tab=favorites" variant="outline">
            <MenuIcon>
              <FaHeart />
            </MenuIcon>
            <MenuLabel>お気に入り</MenuLabel>
            <MenuDesc>気になるリスト</MenuDesc>
          </MenuCard>
        </DashboardGrid>

        {/* ログアウト */}
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

      {/* ランク説明モーダル */}
      <RankModal
        isOpen={isRankModalOpen}
        onClose={() => setIsRankModalOpen(false)}
        currentCount={applicationCount}
      />
    </PageWrapper>
  );
}
