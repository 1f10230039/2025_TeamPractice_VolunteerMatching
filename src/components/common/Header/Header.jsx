// ヘッダーコンポーネント
"use client";

import styled from "@emotion/styled";
import Navigation from "../Navigation/Navigation";
import Link from "next/link";
import Image from "next/image";

// Emotion
// ヘッダー全体を包むコンテナ
const HeaderContainer = styled.header`
  width: 100%;
  padding: 12px 24px 6px 24px;
  background-color: #97cdf3;
  display: flex;
  justify-content: space-between;
  align-items: center;

  /**スマホ(767px以下)ではロゴを中央に表示する */
  @media (max-width: 767px) {
    justify-content: center;
  }
`;

// ロゴリンク（テキストスタイルを削除して、画像用のラッパーにする）
const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  height: 70px;
  position: relative;
  width: 140px;
`;

// PC用のナビゲーションを囲むラッパー (そのまま)
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
          fill // 親要素(LogoLink)いっぱいに広げる
          style={{ objectFit: "contain", objectPosition: "left" }} // 左寄せで、はみ出さないように
          priority // ヘッダーロゴはすぐに表示したいから優先読み込み
        />
      </LogoLink>
      <DesktopNavigation>
        <Navigation />
      </DesktopNavigation>
    </HeaderContainer>
  );
}
