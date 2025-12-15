// 検索オプションのコンポーネント

"use client";

import styled from "@emotion/styled";
import Link from "next/link";
import { FaSearch, FaMapMarkerAlt, FaRobot } from "react-icons/fa";

// Emotion

// 検索オプション全体を包むコンテナ
const SearchBoxContainer = styled.div`
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  padding: 8px;
  max-width: 800px; /* 横幅を制限して中央寄せ */
  margin: 0 auto;
`;

// ボタンを縦に並べるためのコンテナ
const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px; /* ボタン同士の隙間 */
`;

// 共通のリンクボタンスタイル
const SearchLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px 24px;
  background-color: #fff;
  border-radius: 16px;
  text-decoration: none;
  color: #555;
  font-weight: 700;
  font-size: 1.1rem;
  transition: all 0.2s ease-in-out;
  border: 2px solid transparent; /* 枠線の準備 */

  /* アイコン */
  & > svg {
    width: 1.8rem;
    height: 1.8rem;
    margin-right: 16px;
    color: #666;
    transition: transform 0.2s ease;
  }

  /* ホバー時 */
  &:hover {
    background-color: #f0f8ff; /* 薄い青 */
    color: #007bff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.15);
    border-color: #e0f0ff;

    & > svg {
      transform: scale(1.1);
      color: #007bff;
    }
  }

  /* クリック時 */
  &:active {
    transform: translateY(0);
    background-color: #e6f2ff;
  }
`;

export default function SearchOptions() {
  return (
    <SearchBoxContainer>
      <OptionsContainer>
        <SearchLink href="/search/keyword">
          <FaSearch />
          キーワードから探す
        </SearchLink>
        <SearchLink href="/search/location">
          <FaMapMarkerAlt />
          場所から探す
        </SearchLink>
        <SearchLink href="/search/ai">
          <FaRobot />
          AIと相談して探す
        </SearchLink>
      </OptionsContainer>
    </SearchBoxContainer>
  );
}
