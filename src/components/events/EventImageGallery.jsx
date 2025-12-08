"use client";

import { useState } from "react";
import styled from "@emotion/styled";

// --- スタイル定義 ---

const GalleryContainer = styled.div`
  width: 100%;
  margin-bottom: 24px;
`;

// メイン画像の表示エリア
const MainImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 400px; /* 高さを固定 */
  border-radius: 12px;
  overflow: hidden;
  background-color: #f0f0f0;
  margin-bottom: 12px;

  @media (max-width: 600px) {
    height: 250px; /* スマホならちょっと低く */
  }
`;

// 画像本体 (next/image の代わりに styled.img を使用)
const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover; /* 枠いっぱいにトリミング */
`;

// 矢印ボタン (左右)
const ArrowButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
  color: #333;

  /* 左か右かで位置を変える */
  left: ${props => (props.direction === "left" ? "10px" : "auto")};
  right: ${props => (props.direction === "right" ? "10px" : "auto")};

  &:hover {
    background-color: rgba(255, 255, 255, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  /* SVGアイコン用 */
  & svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }
`;

// サムネイル一覧エリア
const ThumbnailList = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto; /* 横スクロール可能に */
  padding-bottom: 8px;

  /* スクロールバーを少し美しく */
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 3px;
  }
`;

// サムネイル画像
const ThumbnailButton = styled.button`
  position: relative;
  width: 80px;
  height: 60px;
  flex-shrink: 0;
  border: 2px solid ${props => (props.isActive ? "#007bff" : "transparent")}; /* 選択中は青枠 */
  border-radius: 6px;
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  opacity: ${props => (props.isActive ? 1 : 0.6)}; /* 非選択時は薄く */
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

// インラインSVGアイコンコンポーネント (react-icons の代わり)
const ChevronLeftIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
  </svg>
);

export default function EventImageGallery({ mainImageUrl, subImages = [] }) {
  // 全画像を1つの配列にまとめる (アイキャッチ + 追加画像)
  // image_url があるものだけフィルタリング
  const allImages = [
    mainImageUrl,
    ...(subImages?.map(img => img.image_url) || []),
  ].filter(url => url);

  const [currentIndex, setCurrentIndex] = useState(0);

  // 画像がない場合のプレースホルダー
  const placeholderImage =
    "https://placehold.co/800x400/e0e0e0/777?text=No+Image";

  // 画像が1枚もない場合
  if (allImages.length === 0) {
    return (
      <GalleryContainer>
        <MainImageWrapper>
          <StyledImage src={placeholderImage} alt="No Image" />
        </MainImageWrapper>
      </GalleryContainer>
    );
  }

  // --- 操作ハンドラ ---
  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = index => {
    setCurrentIndex(index);
  };

  return (
    <GalleryContainer>
      {/* --- メイン画像表示エリア --- */}
      <MainImageWrapper>
        <StyledImage
          src={allImages[currentIndex]}
          alt={`イベント画像 ${currentIndex + 1}`}
        />

        {/* 画像が複数ある時だけ矢印を表示 */}
        {allImages.length > 1 && (
          <>
            <ArrowButton
              direction="left"
              onClick={handlePrev}
              aria-label="前の画像"
            >
              <ChevronLeftIcon />
            </ArrowButton>
            <ArrowButton
              direction="right"
              onClick={handleNext}
              aria-label="次の画像"
            >
              <ChevronRightIcon />
            </ArrowButton>
          </>
        )}
      </MainImageWrapper>

      {/* --- サムネイル一覧エリア --- */}
      {allImages.length > 1 && (
        <ThumbnailList>
          {allImages.map((url, index) => (
            <ThumbnailButton
              key={index}
              isActive={index === currentIndex}
              onClick={() => handleThumbnailClick(index)}
            >
              <StyledImage src={url} alt={`サムネイル ${index + 1}`} />
            </ThumbnailButton>
          ))}
        </ThumbnailList>
      )}
    </GalleryContainer>
  );
}
