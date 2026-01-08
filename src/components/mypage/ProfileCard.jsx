// プロフィールカードコンポーネント
"use client";

import styled from "@emotion/styled";
import { css } from "@emotion/react";
import {
  FaUserCircle,
  FaUniversity,
  FaGraduationCap,
  FaPen,
  FaQuestionCircle,
  FaMedal,
  FaTrophy,
  FaCrown,
} from "react-icons/fa";
import Link from "next/link";

// --- ランクスタイル定義 ---
const RANK_STYLES = {
  BRONZE: {
    label: "ブロンズ",
    min: 0,
    icon: <FaMedal />,
    color: "#a65d3b",
    bg: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
    bg: "linear-gradient(135deg, #ffe8cc 0%, #f4b084 100%)",
    mainColor: "#a65d3b",
  },
  SILVER: {
    label: "シルバー",
    min: 3,
    icon: <FaMedal />,
    color: "#546e7a",
    bg: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    mainColor: "#7f909e",
  },
  GOLD: {
    label: "ゴールド",
    min: 6,
    icon: <FaTrophy />,
    color: "#b7791f",
    bg: "linear-gradient(135deg, #fff7d1 0%, #ffcf40 100%)",
    mainColor: "#d69e2e",
  },
  PLATINUM: {
    label: "プラチナ",
    min: 11,
    icon: <FaCrown />,
    color: "#2c5282",
    bg: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
    mainColor: "#4299e1",
  },
};

// --- ランク取得関数 ---
const getRankData = count => {
  if (count >= 11) return RANK_STYLES.PLATINUM;
  if (count >= 6) return RANK_STYLES.GOLD;
  if (count >= 3) return RANK_STYLES.SILVER;
  return RANK_STYLES.BRONZE;
};

// --- Emotion Styles ---
// カードコンテナ
const CardContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto 40px auto;
  border-radius: 30px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  background: ${props => props.bg};
`;

// クロス柄レイヤー
const PatternLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  opacity: 0.4;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.8) 2px, transparent 2px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.8) 2px, transparent 2px);
  background-size: 40px 40px;
  background-position: center;
  -webkit-mask-image: linear-gradient(
    135deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0) 80%
  );
  mask-image: linear-gradient(
    135deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0) 80%
  );
`;

// カード内容コンテナ
const CardContent = styled.div`
  position: relative;
  z-index: 2;
  padding: 40px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

// ランクバッジ
const RankBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 6px 20px;
  border-radius: 50px;
  font-weight: 800;
  font-size: 1rem;
  margin-bottom: 24px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.2s;
  backdrop-filter: blur(4px);

  & > svg {
    color: ${props => props.iconColor};
  }

  &:hover {
    transform: scale(1.05);
  }
`;

// アバターラッパー
const AvatarWrapper = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background-color: white;
  border: 6px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: -20px;
  position: relative;
  z-index: 5;
  overflow: hidden;
  font-size: 100px;
  color: #ddd;
`;

// アバター画像
const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

// 情報表示用のダークガラスパネル
const InfoPanel = styled.div`
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 40px 20px 20px 20px;
  width: 100%;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  color: white;
`;

// ユーザー名スタイル
const UserName = styled.h2`
  font-size: 1.6rem;
  font-weight: 900;
  margin: 0 0 16px 0;
  letter-spacing: 0.05em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

// メタ情報スタイル
const MetaInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  opacity: 0.9;
`;

// 各メタ情報アイテム
const MetaItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  & svg {
    color: rgba(255, 255, 255, 0.8);
  }
`;

// 編集ボタン
const EditButton = styled(Link)`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: rgba(0, 0, 0, 0.6);
    transform: scale(1.1);
  }
`;

// ヘルプボタン
const HelpButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
  font-size: 1.2rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: rgba(0, 0, 0, 0.6);
    transform: scale(1.1);
  }
`;

// --- コンポーネント本体 ---
export default function ProfileCard({
  profile,
  applicationCount = 0,
  onOpenRankModal,
}) {
  // ランクデータ取得
  const rank = getRankData(applicationCount);

  return (
    <CardContainer bg={rank.bg}>
      {/* クロス柄レイヤー */}
      <PatternLayer />

      <HelpButton onClick={onOpenRankModal} aria-label="ランクとは？">
        <FaQuestionCircle />
      </HelpButton>

      <EditButton href="/mypage/edit" aria-label="プロフィール編集">
        <FaPen size={18} />
      </EditButton>

      <CardContent>
        {/* ランクバッジ */}
        <RankBadge
          iconColor={rank.bg.includes("gold") ? "#ffd700" : "white"}
          onClick={onOpenRankModal}
        >
          {rank.icon}
          {rank.label}サポーター
        </RankBadge>

        {/* アバター */}
        <AvatarWrapper>
          {profile?.avatarUrl ? (
            <AvatarImg src={profile.avatarUrl} alt={profile.name} />
          ) : (
            <FaUserCircle />
          )}
        </AvatarWrapper>

        {/* 情報パネル (黒背景) */}
        <InfoPanel>
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
        </InfoPanel>
      </CardContent>
    </CardContainer>
  );
}
