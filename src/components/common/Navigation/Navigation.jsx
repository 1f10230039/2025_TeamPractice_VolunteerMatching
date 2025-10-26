// 「ホーム」、「マイリスト」、「マイページ」のリンクを並べるためのコンポーネント
"use client";

import Link from "next/link";
import styled from "@emotion/styled";
import { usePathname } from "next/navigation";

// Emotion
// ナビゲーションバーのコンテナスタイル
const NavContainer = styled.nav`
  display: flex;
  gap: 24px;
  padding: 0;
  margin: 0;
`;

// ナビゲーションリンクのスタイル
const StyledLink = styled(Link, {
  shouldForwardProp: prop => prop !== "isActive",
})`
  text-decoration: none;
  color: ${props => (props.isActive ? "#007bff" : "#888")};
  font-weight: bold;

  ${props =>
    !props.isActive &&
    `
    &:hover {
      color: #007bff;   
    }
  `}
`;

export default function Navigation() {
  const pathname = usePathname();
  return (
    <NavContainer>
      <StyledLink href="/" isActive={pathname === "/"}>
        ホーム
      </StyledLink>
      <StyledLink href="/mylist" isActive={pathname === "/mylist"}>
        マイリスト
      </StyledLink>
      <StyledLink href="/mypage" isActive={pathname === "/mypage"}>
        マイページ
      </StyledLink>
    </NavContainer>
  );
}
