// ヘッダーコンポーネント
"use client";

import styled from "@emotion/styled";
import Navigation from "../Navigation/Navigation";
import Link from "next/link";
import Image from "next/image";

// --- Emotion Styles ---
// ヘッダー全体を包むコンテナ
const HeaderContainer = styled.header`
  width: 100%;
  height: 80px;
  padding: 0 24px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  display: flex;
  justify-content: space-between;
  align-items: center;

  position: relative;
  top: 0;
  z-index: 1000;

  @media (max-width: 600px) {
    justify-content: center;
    height: 60px;
  }
`;

// ロゴリンク
const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  height: 100%;
  position: relative;
  width: 160px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  @media (max-width: 767px) {
    font-size: 1.2rem;
    width: 120px;
  }
`;

// PC用のナビゲーションを囲むラッパー
const DesktopNavigation = styled.div`
  display: block;

  @media (max-width: 600px) {
    display: none;
  }
`;

// --- Header Component ---
export default function Header() {
  return (
    <HeaderContainer>
      <LogoLink href="/">
        <Image
          src="/applogo.png"
          alt="ボランティアAppロゴ"
          fill
          style={{ objectFit: "contain", objectPosition: "left" }}
          priority
        />
      </LogoLink>
      <DesktopNavigation>
        <Navigation />
      </DesktopNavigation>
    </HeaderContainer>
  );
}
