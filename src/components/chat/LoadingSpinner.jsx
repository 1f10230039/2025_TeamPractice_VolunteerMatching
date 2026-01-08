// ローディングスピナーコンポーネント
"use client";

/** @jsxImportSource @emotion/react */
import { css, keyframes } from "@emotion/react";

// --- Emotion Styles ---
// スピナーの回転アニメーション
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// スピナー本体のスタイル
const spinner = css`
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #09f;
  animation: ${spin} 1s ease infinite;
  margin: 20px auto;
`;

// ローディングスピナーコンポーネント本体
const LoadingSpinner = () => {
  return <div css={spinner}></div>;
};

export default LoadingSpinner;
