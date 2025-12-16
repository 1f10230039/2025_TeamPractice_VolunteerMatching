"use client";

import styled from "@emotion/styled";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaSearch, FaMapMarkerAlt, FaRobot } from "react-icons/fa";

// Emotion
const SearchBoxContainer = styled.div`
  padding: 30px 24px;
  max-width: 1000px;
  margin: 0 auto;
  @media (max-width: 600px) {
    padding: 10px 5px;
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;

  @media (max-width: 600px) {
    gap: 8px;
    overflow-x: auto; /* スマホなら横スクロール */
    padding-bottom: 4px; /* スクロールバー用 */
  }
`;

// タブ風のボタンスタイル
const SearchLink = styled(Link, {
  shouldForwardProp: prop => prop !== "isActive",
})`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  white-space: nowrap; /* 折り返さない */

  /* アクティブな時 */
  ${props =>
    props.isActive
      ? `
    background-color: #fff;
    color: #007bff;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
    border: 2px solid white;
  `
      : `
    /* 非アクティブな時（背景色になじませる） */
    background-color: rgba(255, 255, 255, 0.3);
    color: #333;
    border: 2px solid transparent;

    &:hover {
      background-color: rgba(255, 255, 255, 0.6);
      color: #007bff;
    }
  `}

  & > svg {
    width: 1.2rem;
    height: 1.2rem;
    margin-right: 8px;
  }

  @media (max-width: 600px) {
    padding: 8px 16px;
    font-size: 0.75rem;

    & > svg {
      width: 1.1rem;
      height: 1.1rem;
    }
  }
`;

export default function SearchOptionsMini() {
  const pathname = usePathname();

  // 今のページがどこかを判定
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
