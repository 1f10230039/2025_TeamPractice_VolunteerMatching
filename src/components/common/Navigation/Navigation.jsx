"use client";

import Link from "next/link";
import styled from "@emotion/styled";
import { usePathname } from "next/navigation";
import { FaHome, FaList, FaUser } from "react-icons/fa";

// Emotion
// ナビゲーションバーのコンテナスタイル
const NavContainer = styled.nav`
  display: flex;
  gap: 12px; /* ボタン同士の間隔 */
  padding: 0;
  margin: 0;
  align-items: center;
`;

// ナビゲーションリンクのスタイル (カプセル型ボタン)
const StyledLink = styled(Link, {
  shouldForwardProp: prop => prop !== "isActive",
})`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px; /* ちょっと大きめに */
  border-radius: 30px; /* 丸っこく */
  text-decoration: none;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;

  /* ★ isActive (今いるページ) の時のスタイル ★ */
  /* マイページと同じ青グラデーション */
  ${props =>
    props.isActive
      ? `
    background: linear-gradient(135deg, #68B5D5 0%, #4A90E2 100%);
    color: white;
    box-shadow: 0 4px 10px rgba(74, 144, 226, 0.3);
    transform: translateY(-1px);

    /* アイコンも白く */
    & > svg {
      color: white;
    }
  `
      : `
    /* 非アクティブの時のスタイル */
    background-color: transparent;
    color: #666;

    &:hover {
      background-color: #f0f8ff; /* 薄い青 */
      color: #007bff;
      transform: translateY(-1px);
      
      & > svg {
        color: #007bff;
      }
    }
  `}

  &:active {
    transform: translateY(0);
    filter: brightness(0.95);
  }

  & > svg {
    width: 1.1rem;
    height: 1.1rem;
    transition: color 0.3s ease;
    /* 非アクティブ時はちょっと薄く */
    color: ${props => (props.isActive ? "white" : "#999")};
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
      <StyledLink
        href="/mylist"
        isActive={pathname === "/mylist" || pathname.startsWith("/mylist")}
      >
        <FaList />
        マイリスト
      </StyledLink>
      <StyledLink
        href="/mypage"
        isActive={pathname === "/mypage" || pathname.startsWith("/mypage")}
      >
        <FaUser />
        マイページ
      </StyledLink>
    </NavContainer>
  );
}
