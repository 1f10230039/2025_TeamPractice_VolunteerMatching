"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import styled from "@emotion/styled";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

// --- Emotion スタイル定義 ---

const SignupWrapper = styled.div`
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

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  width: 100%;
  padding-right: 40px;
`;

const PasswordInputWrapper = styled.div`
  position: relative;
  width: 100%;
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

const Select = styled.select`
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
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
