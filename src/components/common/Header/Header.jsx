// ヘッダーコンポーネント
"use client";

import styled from "@emotion/styled";
import Navigation from "../Navigation/Navigation";
import Link from "next/link";

// Emotion
// ヘッダー全体を包むコンテナ
const HeaderContainer = styled.header`
  width: 100%;
  padding: 16px 24px;
  background-color: #97cdf3;
  display: flex;
  justify-content: space-between;
  align-items: center;

  /**スマホ(767px以下)ではロゴを中央に表示する */
  @media (max-width: 767px) {
    justify-content: center;
  }
`;

// ロゴ用のスタイル
const Logo = styled(Link)`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  text-decoration: none;
`;

// PC用のナビゲーションを囲むラッパー
const DesktopNavigation = styled.div`
  display: block;

  /* スマホ（767px以下）では非表示にする */
  @media (max-width: 767px) {
    display: none;
  }
`;

export default function Header() {
  return (
    <HeaderContainer>
      <Logo href="/">ボランティアApp</Logo>
      <DesktopNavigation>
        <Navigation />
      </DesktopNavigation>
    </HeaderContainer>
  );
}
