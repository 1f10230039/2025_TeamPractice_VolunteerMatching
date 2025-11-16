// 検索オプションのコンポーネント

"use client";

import styled from "@emotion/styled";
import Link from "next/link";
import { FaSearch, FaMapMarkerAlt, FaRobot } from "react-icons/fa";

// Emotion
// 検索オプション全体を包むコンテナ
const SearchBoxContainer = styled.div`
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
`;

// 3つのボタンを「1つのバー」としてまとめるコンテナ
const OptionsContainer = styled.div`
  display: flex;
  border: solid 1px #ccc;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

// 3等分される各ボタン
const SearchLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 0;
  text-decoration: none;
  color: #333;
  font-weight: bold;
  font-size: 1.05rem;
  transition: background-color 0.2s ease;
  flex: 1;
  text-align: center;

  &:not(:last-child) {
    border-right: solid 1px #eee;
  }

  &:hover {
    background-color: #f5f5f5;
  }

  & > svg {
    width: 1.5rem;
    height: 1.5rem;
    margin-right: 12px;
    line-height: 1;
    color: #555;
  }

  @media (max-width: 767px) {
    flex-direction: column;
    padding: 12px 8px;
    font-size: 0.85rem;

    & > svg {
      margin-right: 0;
      margin-bottom: 8px;
      width: 1.4rem;
      height: 1.4rem;
    }
  }
`;

export default function SearchOptionsMini() {
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
