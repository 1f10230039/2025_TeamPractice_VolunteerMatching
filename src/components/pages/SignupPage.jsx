"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import styled from "@emotion/styled";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

// --- Emotion スタイル定義 ---

// サインアップページ全体のラッパー
const SignupWrapper = styled.div`
  padding: 40px 32px;
  max-width: 500px;
  margin: 60px auto;
  border-radius: 20px;
  background-color: #ffffff;
  box-shadow: 0 4px 20px rgba(122, 211, 232, 0.15);
  border: 1px solid #f0f8ff;

  @media (max-width: 600px) {
    padding: 32px 20px;
    margin: 40px 20px 120px 20px;
    width: auto;
  }
`;

// タイトル
const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  color: #333;
  text-align: center;
  margin-bottom: 32px;
  letter-spacing: 0.05em;
`;

// フォーム全体
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

// 入力欄
const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  background-color: #f9f9f9;
  transition: all 0.2s ease;
  color: #333;

  padding-right: ${props => (props.hasIcon ? "48px" : "16px")};

  &::placeholder {
    color: #aaa;
  }

  &:focus {
    outline: none;
    border-color: #4a90e2;
    background-color: #fff;
    box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.1);
  }

  &:disabled {
    background-color: #eee;
    cursor: not-allowed;
  }
`;

const PasswordInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

// 目のアイコン
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

// セレクトボックス
const Select = styled.select`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  background-color: #f9f9f9;
  transition: all 0.2s ease;
  color: #333;
  appearance: none;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #4a90e2;
    background-color: #fff;
    box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.1);
  }

  /* 未選択の時 */
  &:invalid {
    color: #aaa;
  }

  /* 無効化されている時（大学未選択時の学部など） */
  &:disabled {
    background-color: #eaeaea;
    color: #999;
    border-color: #ddd;
    cursor: not-allowed;
  }
`;

// 登録ボタン
const SubmitButton = styled.button`
  margin-top: 12px;
  width: 100%;
  background: linear-gradient(135deg, #68b5d5 0%, #4a90e2 100%);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 30px;
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

/**
 * サインアップページ（新規登録）のレイアウトと状態を管理するコンポーネント
 * @param {{ initialUniversities: Array<object> }} props - サーバー(page.js)から渡される大学リスト
 */
export default function SignupPage({ initialUniversities }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 大学選択時の処理：学部リストを取得
   */
  const handleUniversityChange = async universityId => {
    setSelectedUniversity(universityId);
    setFaculties([]);
    setSelectedFaculty("");

    if (!universityId) return;

    try {
      const { data, error } = await supabase
        .from("faculties")
        .select("id, name")
        .eq("university_id", universityId);

      if (error) throw error;
      setFaculties(data || []);
    } catch (error) {
      console.error("学部リストの取得に失敗:", error);
      setError("学部の取得に失敗しました。");
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. クライアントで直接サインアップ
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. クライアントで直接プロフィール作成 (DBトリガーを使用しないため)
      if (authData.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          name: name,
          university_id: selectedUniversity,
          faculty_id: selectedFaculty,
        });

        if (profileError) throw profileError;
      } else {
        throw new Error("ユーザーデータの取得に失敗しました。");
      }

      // 3. 成功したら待機後に移動
      setTimeout(() => {
        window.location.href = "/mypage";
      }, 500);
    } catch (error) {
      console.error("サインアップエラー:", error);
      let message = "登録中にエラーが発生しました。";
      if (error.message.includes("User already registered")) {
        message = "そのメールアドレスは既に登録されています。";
      }
      setError(message);
      alert(message);
      setIsLoading(false);
    }
  };

  return (
    <SignupWrapper>
      <Title>新規登録</Title>
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
            placeholder="パスワード (6文字以上)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={isLoading}
            hasIcon
          />
          <EyeIconButton
            type="button"
            onClick={toggleShowPassword}
            disabled={isLoading}
          >
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </EyeIconButton>
        </PasswordInputWrapper>

        <Input
          type="text"
          placeholder="名前"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          disabled={isLoading}
        />

        {/* 大学選択セレクトボックス */}
        <Select
          value={selectedUniversity}
          onChange={e => handleUniversityChange(e.target.value)}
          required
          disabled={isLoading}
        >
          <option value="">大学を選択してください</option>
          {initialUniversities.map(uni => (
            <option key={uni.id} value={uni.id}>
              {uni.name}
            </option>
          ))}
        </Select>

        {/* 学部選択セレクトボックス */}
        <Select
          value={selectedFaculty}
          onChange={e => setSelectedFaculty(e.target.value)}
          required
          disabled={!selectedUniversity || isLoading}
        >
          <option value="">学部を選択してください</option>
          {faculties.map(fac => (
            <option key={fac.id} value={fac.id}>
              {fac.name}
            </option>
          ))}
        </Select>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? "登録中..." : "登録する"}
        </SubmitButton>
      </Form>
    </SignupWrapper>
  );
}
