// ナビゲーションコンポーネント
"use client";

import Link from "next/link";
import styled from "@emotion/styled";
import { usePathname } from "next/navigation";
import { FaHome, FaList, FaUser } from "react-icons/fa";

// --- Emotion Styles ---
// ナビゲーションバーのコンテナスタイル
const NavContainer = styled.nav`
  display: flex;
  gap: 12px;
  padding: 0;
  margin: 0;
  align-items: center;
`;

// ナビゲーションリンクのスタイル
const StyledLink = styled(Link, {
  shouldForwardProp: prop => prop !== "isActive",
})`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;

  ${props =>
    // アクティブ・非アクティブのスタイル分岐
    props.isActive
      ? `
     /* アクティブの時のスタイル */
    background-color: #e6f4ff; 
    color: #007bff;
    box-shadow: none; 
    transform: none;
    /* border: 1px solid #b3d7ff; */

    & > svg {
      color: #007bff;
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
    color: ${props => (props.isActive ? "#007bff" : "#999")};
  }
`;

// --- Navigation Component ---
export default function Navigation() {
  // 現在のパス名を取得
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
