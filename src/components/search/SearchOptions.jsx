// 検索オプションのコンポーネント

"use client";

import styled from "@emotion/styled";
import Link from "next/link";
import { FaSearch, FaMapMarkerAlt, FaRobot } from "react-icons/fa";

// Emotion
// 検索オプション全体を包むコンテナ
const SearchBoxContainer = styled.div`
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  margin-top: 16px;
`;

// 3つのボタンを縦に並べるためのコンテナ
const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

// 上のボタン風のリンク
const SearchLinkTop = styled(Link)`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-radius: 8px 8px 0 0;
  background-color: #fff;
  border: none;
  text-decoration: none;
  color: #333;
  font-weight: bold;
  font-size: 1.05rem;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    background-color: #e0e0e0;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  & > svg {
    width: 1.5rem;
    height: 1.5rem;
    margin-right: 12px;
    line-height: 1;
    color: #555;
  }
`;

// 真ん中のボタン風のリンク
const SearchLinkMiddle = styled(Link)`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background-color: #fff;
  border-top: solid 1px #eee;
  border-bottom: solid 1px #eee;
  border-radius: 0;
  text-decoration: none;
  color: #333;
  font-weight: bold;
  font-size: 1.05rem;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    background-color: #e0e0e0;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  & > svg {
    width: 1.5rem;
    height: 1.5rem;
    margin-right: 12px;
    line-height: 1;
    color: #555;
  }
`;

// 下のボタン風のリンク
const SearchLinkBottom = styled(Link)`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-radius: 0 0 12px 12px;
  background-color: #fff;
  border: none;
  text-decoration: none;
  color: #333;
  font-weight: bold;
  font-size: 1.05rem;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    background-color: #e0e0e0;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  & > svg {
    width: 1.5rem;
    height: 1.5rem;
    margin-right: 12px;
    line-height: 1;
    color: #555;
  }
`;

export default function SearchOptions() {
  return (
    <SearchBoxContainer>
      <OptionsContainer>
        <SearchLinkTop href="/search/keyword">
          <FaSearch />
          キーワードから探す
        </SearchLinkTop>
        <SearchLinkMiddle href="/search/location">
          <FaMapMarkerAlt />
          場所から探す
        </SearchLinkMiddle>
        <SearchLinkBottom href="/search/ai">
          <FaRobot />
          AIと相談して探す
        </SearchLinkBottom>
      </OptionsContainer>
    </SearchBoxContainer>
  );
}
