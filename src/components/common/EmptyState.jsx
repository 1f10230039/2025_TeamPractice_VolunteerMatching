"use client";

import styled from "@emotion/styled";

// 泣き顔アイコン
const SadTearIcon = () => (
  <svg
    stroke="currentColor"
    fill="none"
    strokeWidth="0"
    viewBox="0 0 512 512"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M256 32C132.3 32 32 132.3 32 256s100.3 224 224 224 224-100.3 224-224S379.7 32 256 32zm0 416c-105.9 0-192-86.1-192-192S150.1 64 256 64s192 86.1 192 192-86.1 192-192 192zm-70.4-232c21.2 0 38.4-17.2 38.4-38.4S206.8 140.8 185.6 140.8 147.2 158 147.2 179.2s17.2 36.8 38.4 36.8zm140.8 0c21.2 0 38.4-17.2 38.4-38.4S347.6 140.8 326.4 140.8s-38.4 17.2-38.4 38.4 17.2 36.8 38.4 36.8zM256 368c58.2 0 109.2-26.7 139.7-69.1 4.3-6 1.6-14.2-5.4-16.1-5.1-1.4-10.4 1.3-12.7 6.1-23.7 49-72.3 83.1-121.6 83.1-49.3 0-97.9-34.1-121.6-83.1-2.3-4.8-7.7-7.5-12.7-6.1-7 1.9-9.7 10.1-5.4 16.1C146.8 341.3 197.8 368 256 368z"
      fill="currentColor"
    ></path>
  </svg>
);

// --- スタイル定義 ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background-color: #fcfcfc;
  border-radius: 12px;
  border: 2px dashed #eee;
  margin-top: 20px;
`;

const IconWrapper = styled.div`
  font-size: 4rem;
  color: #ccc;
  margin-bottom: 20px;

  /* ふわふわ浮いてるようなアニメーション */
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0px);
    }
  }

  /* SVGのサイズ調整 */
  & svg {
    display: block;
  }
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: #555;
  margin-bottom: 12px;
`;

const Description = styled.p`
  font-size: 0.95rem;
  color: #888;
  margin-bottom: 32px;
  line-height: 1.6;
  max-width: 400px;
`;

const ActionButton = styled.a`
  display: inline-block;
  padding: 12px 32px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: bold;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 123, 255, 0.2);
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 123, 255, 0.3);
  }
`;

/**
 * データがない時に表示する共通コンポーネント
 * @param {{
 * title: string,       // メインメッセージ
 * description: string, // サブメッセージ
 * icon?: ReactNode,    // アイコン (省略可)
 * actionLabel?: string,// ボタンの文字 (省略可)
 * actionHref?: string  // ボタンのリンク先 (省略可)
 * }} props
 */
export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  actionHref,
}) {
  return (
    <Container>
      <IconWrapper>{icon || <SadTearIcon />}</IconWrapper>
      <Title>{title}</Title>
      <Description>{description}</Description>

      {/* ボタン情報があれば表示する */}
      {actionLabel && actionHref && (
        <ActionButton href={actionHref}>{actionLabel}</ActionButton>
      )}
    </Container>
  );
}
