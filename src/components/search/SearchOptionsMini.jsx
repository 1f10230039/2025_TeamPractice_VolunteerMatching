// 検索オプションのコンポーネント

"use client";

import styled from "@emotion/styled";
import Link from "next/link";

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

  & > span {
    font-size: 1.8rem;
    margin-right: 12px;
    line-height: 1;
  }

  @media (max-width: 767px) {
    flex-direction: column;
    padding: 12px 8px;
    font-size: 0.85rem;

    & > span {
      margin-right: 0;
      margin-bottom: 8px;
      font-size: 1.6rem;
    }
  }
`;

export default function SearchOptionsMini() {
  return (
    <SearchBoxContainer>
      <OptionsContainer>
        <SearchLink href="/search/keyword">
          <span>🔍</span>キーワードから探す
        </SearchLink>
        <SearchLink href="/search/location">
          <span>📍</span>場所から探す
        </SearchLink>
        <SearchLink href="/search/ai">
          <span>🤖</span>AIと相談して探す
        </SearchLink>
      </OptionsContainer>
    </SearchBoxContainer>
  );
}
