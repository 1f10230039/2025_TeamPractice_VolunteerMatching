// src/components/auth/AuthPrompt.jsx

"use client"; // クライアントコンポーネント宣言

import styled from "@emotion/styled";
import Link from "next/link"; // ページ遷移用のLinkコンポーネント
import { FiLogIn, FiUserPlus } from "react-icons/fi";

// --- Emotion Styles ---

// コンポーネント全体のラッパー
const PromptWrapper = styled.div`
  padding: 48px 32px;
  max-width: 600px;
  margin: 60px auto;
  border-radius: 20px;
  background-color: #ffffff;
  text-align: center;
  box-shadow: 0 4px 20px rgba(122, 211, 232, 0.15);
  border: 1px solid #f0f8ff;

  @media (max-width: 600px) {
    padding: 32px 20px;
    margin: 40px 20px;
  }
`;

// メッセージテキスト
const Message = styled.p`
  font-size: 1.1rem;
  color: #444;
  margin-bottom: 32px;
  line-height: 1.6;
  font-weight: 500;
`;

// ボタンを横に並べるためのコンテナ
const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
`;

// Next.jsのLinkをスタイリング
const StyledLink = styled(Link, {
  shouldForwardProp: prop => prop !== "primary",
})`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;

  /* アニメーションの共通設定 */
  transition: all 0.2s ease;

  /* --- ボタンごとのスタイル分岐 --- */
  ${props =>
    props.primary
      ? `
        /* ログインボタン（メイン） */
        background: linear-gradient(135deg, #68b5d5 0%, #4a90e2 100%);
        color: white;
        border: none;
        box-shadow: 0 4px 10px rgba(74, 144, 226, 0.3);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(74, 144, 226, 0.4);
          filter: brightness(1.05);
        }
        
        &:active {
          transform: translateY(0);
          box-shadow: 0 2px 5px rgba(74, 144, 226, 0.2);
        }
      `
      : `
        /* 新規登録ボタン（サブ） */
        background-color: #fff;
        color: #555;
        border: 2px solid #eee;

        &:hover {
          transform: translateY(-2px);
          background-color: #f9f9f9;
          border-color: #ddd;
          color: #333;
        }

        &:active {
          transform: translateY(0);
        }
      `}
`;

/**
 * 未ログイン時にマイページなどで表示するコンポーネント
 */
export default function AuthPrompt({ message }) {
  return (
    <PromptWrapper>
      <Message>
        {message || (
          <>
            この機能を利用するには、
            <br className="sp-only" />
            ログインまたは新規登録が必要です。
          </>
        )}
      </Message>

      <ButtonContainer>
        {/* ログイン（メインアクション） */}
        <StyledLink href="/login" primary="true">
          <FiLogIn />
          <span>ログイン</span>
        </StyledLink>

        {/* 新規登録（サブアクション） */}
        <StyledLink href="/signup">
          <FiUserPlus />
          <span>新規登録</span>
        </StyledLink>
      </ButtonContainer>
    </PromptWrapper>
  );
}
