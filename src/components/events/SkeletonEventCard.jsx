//スケルトンコンポーネント
"use client";

import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

// --- Emotion ---
// --- アニメーション定義 ---
const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// --- スケルトンの基本スタイル ---
const SkeletonBase = styled.div`
  background: #f0f0f0;
  background-image: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #f8f8f8 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite linear;
  border-radius: 4px;
`;

// --- カードのレイアウト ---
const CardContainer = styled.div`
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  background-color: #fff;
  display: block;
  height: 100%;
`;

// 画像部分のスケルトン
const ImageSkeleton = styled(SkeletonBase)`
  width: 100%;
  height: 180px;
  border-radius: 0;
`;

// コンテンツ部分のパディング
const ContentPadding = styled.div`
  padding: 16px;
`;

// タグスケルトン
const TagSkeleton = styled(SkeletonBase)`
  width: 60px;
  height: 20px;
  border-radius: 4px;
  margin-bottom: 12px;
  display: inline-block;
  margin-right: 8px;
`;

// タイトルスケルトン
const TitleSkeleton = styled(SkeletonBase)`
  width: 80%;
  height: 24px;
  margin-bottom: 12px;
`;

// 詳細情報行スケルトン
const InfoRowSkeleton = styled(SkeletonBase)`
  width: 100%;
  height: 16px;
  margin-bottom: 8px;

  &:last-child {
    width: 60%;
    margin-bottom: 0;
  }
`;

// --- コンポーネント本体 ---
export default function SkeletonEventCard() {
  return (
    <CardContainer>
      {/* 画像部分 */}
      <ImageSkeleton />

      <ContentPadding>
        {/* タグ部分 */}
        <div style={{ marginBottom: "12px" }}>
          <TagSkeleton />
          <TagSkeleton />
        </div>

        {/* タイトル */}
        <TitleSkeleton />

        {/* 詳細情報 (場所、費用、日時) */}
        <div style={{ marginTop: "16px" }}>
          <InfoRowSkeleton />
          <InfoRowSkeleton />
          <InfoRowSkeleton />
        </div>
      </ContentPadding>
    </CardContainer>
  );
}
