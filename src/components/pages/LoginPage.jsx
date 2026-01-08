// ログインページコンポーネント
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import styled from "@emotion/styled";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

// --- Emotion スタイル定義 ---
// ログインページ全体のラッパー
const LoginWrapper = styled.div`
  padding: 40px 32px;
  max-width: 480px;
  margin: 60px auto;
  border-radius: 20px;
  background-color: #ffffff;
  box-shadow: 0 4px 20px rgba(122, 211, 232, 0.15);
  border: 1px solid #f0f8ff;

  @media (max-width: 600px) {
    padding: 32px 20px;
    margin: 40px 20px;
    width: auto;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  color: #333;
  text-align: center;
  margin-bottom: 32px;
  letter-spacing: 0.05em;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PasswordInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

// 入力欄のデザイン
const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  background-color: #f9f9f9;
  transition: all 0.2s ease;
  color: #333;
  padding-right: 48px;

  &::placeholder {
    color: #aaa;
  }

  &:focus {
    outline: none;
    border-color: #4a90e2;
    background-color: #fff;
    box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.1);
  }
`;

// 目のアイコンボタン
const EyeIconButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 22px;
  color: #888;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  border-radius: 50%;

  &:hover {
    color: #4a90e2;
    background-color: rgba(74, 144, 226, 0.1);
  }
`;

// ログインボタン
const SubmitButton = styled.button`
  margin-top: 12px;
  width: 100%;
  background: linear-gradient(135deg, #68b5d5 0%, #4a90e2 100%);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 30px; /* 丸く */
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(74, 144, 226, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(74, 144, 226, 0.4);
    filter: brightness(1.05);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(74, 144, 226, 0.2);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

// エラーメッセージ
const ErrorMessage = styled.p`
  color: #e74c3c;
  font-size: 14px;
  background-color: #fdf0f0;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #fadbd8;
`;

// --- コンポーネント本体 ---

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // クライアント側で直接ログインを実行
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      // ログイン成功後、クッキーの保存を確実にするため少し待機してから移動
      setTimeout(() => {
        window.location.href = "/mypage";
      }, 500);
    } catch (error) {
      console.error("ログインエラー:", error);

      let message = "ログイン中にエラーが発生しました。";
      if (error.message.includes("Invalid login credentials")) {
        message = "メールアドレスかパスワードが間違っています。";
      }

      setError(message);
      alert(message);
      setIsLoading(false);
    }
  };

  return (
    <LoginWrapper>
      <Title>ログイン</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />

        <PasswordInputWrapper>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="パスワード"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <EyeIconButton
            type="button"
            onClick={toggleShowPassword}
            disabled={isLoading}
          >
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </EyeIconButton>
        </PasswordInputWrapper>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? "ログイン中..." : "ログイン"}
        </SubmitButton>
      </Form>
    </LoginWrapper>
  );
}
