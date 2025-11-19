// src/components/auth/AuthPrompt.jsx

"use client"; // クライアントコンポーネント宣言

import styled from "@emotion/styled";
import Link from "next/link"; // ページ遷移用のLinkコンポーネント

// Emotion
// コンポーネント全体のラッパー
const PromptWrapper = styled.div`
  padding: 40px 24px;
  max-width: 600px;
  margin: 40px auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
  text-align: center;
`;

// メッセージテキスト
const Message = styled.p`
  font-size: 18px;
  color: #333;
  margin-bottom: 24px;
`;

// ボタンを横に並べるためのコンテナ
const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px; /* ボタン間のスペース */
`;

// Next.jsのLinkをEmotionでスタイリング
const StyledLink = styled(Link, {
  shouldForwardProp: prop => prop !== "primary",
})`
  display: inline-block;
  padding: 12px 24px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none; /* リンクの下線を消す */
  transition: all 0.2s;

  /* ボタンごとのスタイル分岐 */
  ${props =>
    props.primary
      ? `
        background-color: #007bff; /* ログイン (キーカラー) */
        color: white;
        &:hover {
          background-color: #0056b3;
        }
      `
      : `
        background-color: #f0f0f0; /* 新規登録 (控えめ) */
        color: #333;
        border: 1px solid #ccc;
        &:hover {
          background-color: #e0e0e0;
        }
      `}
`;

/**
 * 未ログイン時にマイページで表示するコンポーネント
 * @param {{ message?: string }} props - オプションのメッセージ
 */
export default function AuthPrompt({ message }) {
  return (
    <PromptWrapper>
      <Message>
        {message ||
          "この機能を利用するには、ログインまたは新規登録が必要です。"}
      </Message>
      <ButtonContainer>
        {/*
          Next.jsの <Link> コンポーネントを使うことで、
          ブラウザリロードなしの高速なページ遷移(SPA)を実現します。
          href="" で遷移先を指定します。
        */}
        <StyledLink href="/login" primary>
          ログイン
        </StyledLink>
        <StyledLink href="/signup">新規登録</StyledLink>
      </ButtonContainer>
    </PromptWrapper>
  );
}
