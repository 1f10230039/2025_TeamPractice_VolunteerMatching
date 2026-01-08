// スケルトンリストコンポーネント
"use client";

import styled from "@emotion/styled";
import SkeletonEventCard from "./SkeletonEventCard";

// --- Emotion Styles ---
// スケルトンリスト全体のコンテナスタイル
const ListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
  margin-top: 16px;
`;

/**
 * 読み込み中に表示するスケルトンリスト
 * @param {{ count: number }} props - 表示するスケルトンの数 (デフォルト6)
 */
export default function SkeletonList({ count = 6 }) {
  // 指定された数だけ SkeletonEventCard を並べる
  return (
    <ListContainer>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonEventCard key={index} />
      ))}
    </ListContainer>
  );
}
