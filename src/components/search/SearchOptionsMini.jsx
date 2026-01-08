// ミニ検索結果コンポーネント
"use client";

import styled from "@emotion/styled";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaSearch, FaMapMarkerAlt, FaRobot } from "react-icons/fa";

// --- Emotion ---
const SearchBoxContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

// オプション群のラッパー
const OptionsContainer = styled.div`
  display: flex;
  gap: 24px;
  justify-content: center;

  @media (max-width: 600px) {
    gap: 8px;
    width: 100%;
    overflow-x: auto;
    padding: 0 16px;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

// タブ風ボタン
const SearchLink = styled(Link, {
  shouldForwardProp: prop => prop !== "isActive",
})`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px 24px;
  margin: 8px 0;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  white-space: nowrap;

  ${props =>
    props.isActive
      ? `
    /* アクティブ */
    background-color: #ffffff;
    color: #4a90e2;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  `
      : `
    /* 非アクティブ */
    background-color: rgba(255, 255, 255, 0.9);
    color: #666666;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);

    &:hover {
      background-color: #f0f0f0;
      color: #4a90e2;
    }
  `}

  & > svg {
    width: 1.1rem;
    height: 1.1rem;
    margin-right: 8px;
  }

  @media (max-width: 600px) {
    padding: 12px 16px;
    margin: 5px 0;
    font-size: 0.7rem;
    flex-shrink: 0;

    & > svg {
      width: 1rem;
      height: 1rem;
      margin-right: 6px;
    }
  }
`;

export default function SearchOptionsMini() {
  const pathname = usePathname();

  const isKeyword =
    pathname.includes("/search/keyword") ||
    pathname.includes("/search/results");
  const isLocation = pathname.includes("/search/location");
  const isAi = pathname.includes("/search/ai");

  return (
    <SearchBoxContainer>
      <OptionsContainer>
        <SearchLink href="/search/keyword" isActive={isKeyword}>
          <FaSearch />
          キーワード
        </SearchLink>
        <SearchLink href="/search/location" isActive={isLocation}>
          <FaMapMarkerAlt />
          場所から
        </SearchLink>
        <SearchLink href="/search/ai" isActive={isAi}>
          <FaRobot />
          AI相談
        </SearchLink>
      </OptionsContainer>
    </SearchBoxContainer>
  );
}
