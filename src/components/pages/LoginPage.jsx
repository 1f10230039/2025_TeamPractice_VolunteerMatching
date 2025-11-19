// src/components/pages/LoginPage.jsx

"use client"; // クライアントコンポーネント宣言

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import styled from "@emotion/styled";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

// Emotion
// フォーム全体のラッパー
const LoginWrapper = styled.div`
  padding: 24px;
  max-width: 500px; /* フォームの最大幅 */
  margin: 40px auto; /* 中央寄せ */
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
`;

// H1見出し
const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 24px;
`;

// フォーム
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px; /* 各入力欄の間隔 */
`;

const PasswordInputWrapper = styled.div`
  position: relative; /* アイコンを絶対配置するための基準 */
  width: 100%; /* フォームに対して100%幅 */
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  width: 100%;
  padding-right: 40px;
`;

// 目のアイコンを配置するボタン
const EyeIconButton = styled.button`
  position: absolute; /* 親(PasswordInputWrapper)を基準に絶対配置 */
  right: 10px; /* 入力欄の右端から10px */
  top: 50%; /* 上下中央に配置 (1/2) */
  transform: translateY(-50%); /* 上下中央に配置 (2/2) */

  background: transparent;
  border: none;
  cursor: pointer;

  font-size: 20px; /* アイコンの大きさを指定 */
  color: #555; /* アイコンの色 */
  padding: 0;
  display: flex; /* アイコンを中央に配置するため */
  align-items: center;
`;

// 送信ボタン
const SubmitButton = styled.button`
  background-color: #007bff; /* キーカラー */
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
`;

// エラーメッセージ表示用
const ErrorMessage = styled.p`
  color: red;
  font-size: 14px;
  margin-top: 8px;
`;

/**
 * ログインページ全体のレイアウトと状態を管理するコンポーネント
 */
export default function LoginPage() {
  const router = useRouter(); // ページ遷移用

  // フォームの入力値をReactのstateで管理
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // エラーメッセージ用
  const [showPassword, setShowPassword] = useState(false);

  /**
   * ログイン（フォーム送信）時の処理
   */
  const handleSubmit = async e => {
    e.preventDefault(); // フォームのデフォルト送信をキャンセル
    setError(null); // エラーをリセット

    try {
      // Supabaseのクライアントライブラリでログイン処理を実行
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        throw signInError; // ログインエラー
      }

      setTimeout(() => {
        window.location.href = "/mypage";
      }, 100); // 100ミリ秒待つ
    } catch (error) {
      console.error("ログインエラー(LoginPage.jsx):", error);

      // ★★★ ここを修正 ★★★
      // エラーメッセージの内容を判定して、ユーザーに分かりやすい言葉にする
      let message = "ログイン中にエラーが発生しました。";

      if (error.message.includes("Invalid login credentials")) {
        message = "メールアドレスかパスワードが間違っています。";
      }

      // 1. 画面に赤文字で出す（既存）
      setError(message);

      // 2. ポップアップ（アラート）でも出す（新規追加）
      alert(message);
    }
  };

  /**
   * パスワードの表示/非表示を切り替える関数
   */
  const toggleShowPassword = () => {
    // 現在の showPassword の値 (true/false) を反転させる
    setShowPassword(!showPassword);
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
        />

        <PasswordInputWrapper>
          <Input
            // stateに応じて type を切り替える
            type={showPassword ? "text" : "password"}
            placeholder="パスワード"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {/*
           * 目のアイコンボタン
           * フォームが送信されないよう type="button" を指定
           */}
          <EyeIconButton type="button" onClick={toggleShowPassword}>
            {/* showPassword が true なら「隠す」アイコン、false なら「見せる」アイコン */}
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </EyeIconButton>
        </PasswordInputWrapper>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <SubmitButton type="submit">ログイン</SubmitButton>
      </Form>
    </LoginWrapper>
  );
}
