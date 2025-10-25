// フッタータブバーコンポーネント
"use client";

import styled from "@emotion/styled";
import Navigation from "../Navigation/Navigation";

// Emotion

// フッタータブバー全体を包むコンテナ
const FooterContainer = styled.footer`
  /* スマホ用のスタイリング */
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #ffffff;
  border-top: 1px solid #eee;
  padding: 12px 0;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.05);

  /* 768px以上の画面（PC）では、このフッターを非表示にする */
  @media (min-width: 768px) {
    display: none;
  }

  /* 中のナビゲーションコンテナ（NavContainer）のスタイルを上書き */
  & > nav {
    justify-content: space-around;
    width: 100%;
    gap: 0;
  }

  /* ナビゲーション内のリンクスタイルを上書き */
  & a {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 12px;
    gap: 4px;
  }
`;

const FooterTabBar = () => {
  return (
    <FooterContainer>
      <Navigation />
    </FooterContainer>
  );
};

export default FooterTabBar;
