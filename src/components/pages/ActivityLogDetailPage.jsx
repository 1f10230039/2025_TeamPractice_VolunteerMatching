"use client";

import styled from "@emotion/styled";
import Link from "next/link";
import {
  FaPen,
  FaCalendarAlt,
  FaBullseye,
  FaPencilAlt,
  FaBuilding,
  FaUsers,
  FaLightbulb,
  FaQuoteLeft,
} from "react-icons/fa";
import Breadcrumbs from "../common/Breadcrumbs";

// --- Emotion Styles ---

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: #f5fafc; /* マイページと同じ優しい背景色 */
  padding-bottom: 60px;
  font-family: "Helvetica Neue", Arial, sans-serif;
`;

// パンくずリストを固定するためのラッパー
const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #f5fafc;
`;

const ContentContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
`;

// --- ヒーローエリア（タイトル・日付） ---
const HeroSection = styled.div`
  background-color: white;
  padding: 40px 32px;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(122, 211, 232, 0.15);
  margin-top: 24px;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;

  /* 背景にうっすら装飾を入れる */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 8px;
    height: 100%;
    background: linear-gradient(to bottom, #68b5d5, #4a90e2);
  }
`;

const DateBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #f0f8ff;
  color: #4a90e2;
  padding: 6px 16px;
  border-radius: 30px;
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 16px;
  box-shadow: 0 2px 5px rgba(74, 144, 226, 0.1);
`;

const LogTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: #333;
  line-height: 1.4;
  margin: 0;

  @media (max-width: 600px) {
    font-size: 1.6rem;
  }
`;

// 編集ボタン (右上に配置)
const EditButton = styled(Link)`
  position: absolute;
  top: 24px;
  right: 24px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #f8f9fa;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: #e0eafc;
    color: #4a90e2;
    transform: scale(1.1);
  }
`;

// --- 「想い」のセクション (Reflection) ---
const ReflectionCard = styled.div`
  background: linear-gradient(135deg, #fff 0%, #fffbf0 100%);
  border: 2px solid #fff;
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 40px;
  position: relative;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.03);
`;

const QuoteIcon = styled(FaQuoteLeft)`
  position: absolute;
  top: 24px;
  left: 24px;
  font-size: 2rem;
  color: #ffecd2; /* 淡いオレンジ */
  z-index: 0;
`;

const ReflectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  color: #d4a373;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
`;

const ReflectionText = styled.p`
  font-size: 1.15rem;
  line-height: 1.8;
  color: #5d4037;
  white-space: pre-wrap;
  position: relative;
  z-index: 1;
  font-weight: 500;
`;

// --- 詳細情報のグリッド ---
const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
`;

const DetailCard = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
  border: 1px solid #f0f0f0;
`;

const SectionHeader = styled.h3`
  font-size: 1.4rem;
  font-weight: 800;
  color: #333;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;

  &::before {
    content: "";
    width: 6px;
    height: 28px;
    background: linear-gradient(to bottom, #68b5d5, #4a90e2);
    border-radius: 3px;
    display: block;
  }
`;

const SectionBody = styled.div`
  font-size: 1rem;
  line-height: 1.7;
  color: #555;
  white-space: pre-wrap;
`;

// 3カラムの情報 (規模、人数など)
const MetaInfoRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const MetaCard = styled.div`
  background-color: white;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  border: 1px solid #eee;

  h4 {
    font-size: 0.85rem;
    color: #888;
    margin: 0 0 8px 0;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  p {
    font-size: 1.1rem;
    font-weight: 700;
    color: #333;
    margin: 0;
  }
`;

// 日付フォーマット関数
const formatDate = dateString => {
  if (!dateString) return "日付未定";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  } catch (e) {
    return "日付形式エラー";
  }
};

export default function ActivityLogDetailPage({ log }) {
  const { id, name, datetime, reason, numbers, content, learning, reflection } =
    log;

  // パンくずリスト
  const crumbs = [
    { label: "活動の記録", href: "/activity-log" },
    { label: name || "活動詳細", href: `/activity-log/${id}` },
  ];
  const baseCrumb = { label: "マイページ", href: "/mypage" };

  return (
    <PageWrapper>
      {/* 1. 上部固定パンくずリスト */}
      <StickyHeader>
        <Breadcrumbs crumbs={crumbs} baseCrumb={baseCrumb} />
      </StickyHeader>

      <ContentContainer>
        {/* 2. ヒーローセクション（タイトル・日付） */}
        <HeroSection>
          <DateBadge>
            <FaCalendarAlt />
            {formatDate(datetime)}
          </DateBadge>
          <LogTitle>{name || "無題の活動"}</LogTitle>

          {/* 編集ボタン */}
          <EditButton href={`/activity-log/${id}/edit`} aria-label="編集する">
            <FaPen />
          </EditButton>
        </HeroSection>

        {/* 3. 「あの日の想い」セクション (一番目立たせる！) */}
        {reflection && (
          <ReflectionCard>
            <QuoteIcon />
            <ReflectionTitle>活動の感想・反省</ReflectionTitle>
            <ReflectionText>{reflection}</ReflectionText>
          </ReflectionCard>
        )}

        {/* 4. 基本情報 (人数など) */}
        <MetaInfoRow>
          <MetaCard>
            <h4>
              <FaUsers /> 参加人数
            </h4>
            <p>{numbers ? `${numbers}人` : "-"}</p>
          </MetaCard>
          {/* 必要なら他のメタ情報もここに追加 */}
        </MetaInfoRow>

        {/* 5. ストーリー詳細 */}
        <DetailGrid>
          {/* きっかけ */}
          <DetailCard>
            <SectionHeader>
              <FaBullseye /> 参加した理由・目的
            </SectionHeader>
            <SectionBody>{reason || "記載なし"}</SectionBody>
          </DetailCard>

          {/* やったこと */}
          <DetailCard>
            <SectionHeader>
              <FaPencilAlt /> 活動内容
            </SectionHeader>
            <SectionBody>{content || "記載なし"}</SectionBody>
          </DetailCard>

          {/* 学び */}
          <DetailCard>
            <SectionHeader>
              <FaLightbulb /> 活動による学び
            </SectionHeader>
            <SectionBody>{learning || "記載なし"}</SectionBody>
          </DetailCard>
        </DetailGrid>
      </ContentContainer>
    </PageWrapper>
  );
}
