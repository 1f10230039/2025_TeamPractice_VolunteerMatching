// 「ホーム」、「マイリスト」、「マイページ」のリンクを並べるためのコンポーネント
"use client";

import Link from "next/link";
import styled from "@emotion/styled";

// Emotion
// ナビゲーションバーのコンテナスタイル
const NavContainer = styled.nav`
  display: flex;
  gap: 24px;
  padding: 0;
  margin: 0;
`;

// ナビゲーションリンクのスタイル
const StyledLink = styled(Link)`
  text-decoration: none;
  color: #333;
  font-weight: bold;

  &:hover {
    color: #007bff;
  }
`;

export default function Navigation() {
  return (
    <NavContainer>
      <StyledLink href="/">ホーム</StyledLink>
      <StyledLink href="/mylist">マイリスト</StyledLink>
      <StyledLink href="/mypage">マイページ</StyledLink>
    </NavContainer>
  );
}
