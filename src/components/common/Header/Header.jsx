"use client";

import styled from "@emotion/styled";
import Navigation from "../Navigation/Navigation";
import Link from "next/link";
import Image from "next/image";

// Emotion
// ヘッダー全体を包むコンテナ
const HeaderContainer = styled.header`
  width: 100%;
  height: 80px; /* 高さを固定して安定させる */
  padding: 0 24px;

  /* 白ベースで少し透過させる（モダン！） */
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px); /* すりガラス効果 */

  /* 下線ではなく、ふんわりした影で浮き上がらせる */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  display: flex;
  justify-content: space-between;
  align-items: center;

  position: sticky; /* スクロールしても上にくっついてくる */
  top: 0;
  z-index: 1000; /* 他の要素より手前に */

  /**スマホ(767px以下)ではロゴを中央に表示する */
  @media (max-width: 767px) {
    justify-content: center;
    height: 60px; /* スマホなら少し低く */
  }
`;

// ロゴリンク
const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  height: 100%; /* ヘッダーの高さに合わせる */
  position: relative;
  width: 160px; /* 少し大きめに確保 */
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

// PC用のナビゲーションを囲むラッパー
const DesktopNavigation = styled.div`
  display: block;
  @media (max-width: 767px) {
    display: none;
  }
`;

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
