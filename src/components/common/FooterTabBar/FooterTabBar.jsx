// フッタータブバーコンポーネント
"use client";

import styled from "@emotion/styled";
import Navigation from "../Navigation/Navigation";

// --- Emotion Styles ---
// フッタータブバー全体を包むコンテナ
const FooterContainer = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  height: 90px;
  width: 100%;
  background: #fff;
  border-top: 1px solid #eee;
  padding: 16px 0;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.05);

  @media (min-width: 600px) {
    display: none;
  }

  & > nav {
    justify-content: space-around;
    width: 100%;
    gap: 0;
  }

  & a {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 12px;
    gap: 4px;
  }
`;

// --- FooterTabBar Component ---
export default function FooterTabBar() {
  return (
    <FooterContainer>
      <Navigation />
    </FooterContainer>
  );
}
