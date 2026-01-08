//　ボランティア登録管理システムコンポーネント
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "@emotion/styled";

const LoginPageContainer = styled.div`
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h1`
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 20px;
`;

const PasswordForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Input = styled.input`
  padding: 12px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
`;

const Button = styled.button`
  padding: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const ADMIN_PASSWORD = "0123"; // 管理者用パスワード

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");

  // ログインボタンが押された時の処理
  const handleLogin = e => {
    e.preventDefault(); // ページの再読み込みを防ぐ

    // パスワードが合ってるかチェック！
    if (password === ADMIN_PASSWORD) {
      // 合ってたら、プラン通りの「既存のボランティアページ」に飛ばす
      alert("認証に成功しました。");
      router.push("/volunteer-registration/admin/events");
    } else {
      // 間違ってたら、プラン通りエラーを出して「ホーム」に飛ばす
      alert("パスワードが間違っています。");
      router.push("/");
    }
  };

  return (
    <LoginPageContainer>
      <Title>管理者認証</Title>
      <PasswordForm onSubmit={handleLogin}>
        <Input
          type="password"
          placeholder="パスワードを入力"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <Button type="submit">認証</Button>
      </PasswordForm>
    </LoginPageContainer>
  );
}
