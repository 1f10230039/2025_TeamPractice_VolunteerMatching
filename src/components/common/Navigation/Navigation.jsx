// 「ホーム」、「マイリスト」、「マイページ」のリンクを並べるためのコンポーネント
"use client";

import Link from "next/link";
import styled from "@emotion/styled";
import { usePathname } from "next/navigation";
import { FaHome, FaList, FaUser } from "react-icons/fa";

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
  display: flex;
  align-items: center;
  gap: 6px;

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

  & > svg {
    width: 1.1rem;
    height: 1.1rem;
  }
`;

export default function Navigation() {
  const pathname = usePathname();
  return (
    <NavContainer>
      <StyledLink href="/" isActive={pathname === "/"}>
        <FaHome />
        ホーム
      </StyledLink>
      <StyledLink href="/mylist" isActive={pathname === "/mylist"}>
        <FaList />
        マイリスト
      </StyledLink>
      <StyledLink href="/mypage" isActive={pathname === "/mypage"}>
        <FaUser />
        マイページ
      </StyledLink>
    </NavContainer>
  );
}
