"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import styled from "@emotion/styled";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

// --- Emotion スタイル定義 ---

const LoginWrapper = styled.div`
  padding: 24px;
  max-width: 500px;
  margin: 40px auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PasswordInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  width: 100%;
  padding-right: 40px;
`;

const EyeIconButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #555;
  padding: 0;
  display: flex;
  align-items: center;
`;

const SubmitButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }

  /* ローディング中(disabled)のスタイル */
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 14px;
  margin-top: 8px;
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
