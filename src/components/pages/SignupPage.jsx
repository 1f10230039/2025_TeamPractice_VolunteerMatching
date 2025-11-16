// src/components/pages/SignupPage.jsx

"use client"; // クライアントコンポーネント宣言

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import styled from "@emotion/styled";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

// Emotion
// フォーム全体のラッパー
const SignupWrapper = styled.div`
  padding: 24px;
  max-width: 500px;
  margin: 40px auto;
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
  gap: 16px;
`;

// 入力欄（input）
const Input = styled.input`
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  width: 100%;
  /* 目のアイコンと重ならないよう、右側に余白を確保 */
  padding-right: 40px;
`;

// パスワード入力欄とアイコンをまとめるラッパー
const PasswordInputWrapper = styled.div`
  position: relative; /* アイコンを絶対配置するための基準 */
  width: 100%;
`;

// 目のアイコンを配置するボタン
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

// 選択欄（select）
const Select = styled.select`
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
`;

// 送信ボタン
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
`;

// エラーメッセージ表示用
const ErrorMessage = styled.p`
  color: red;
  font-size: 14px;
  margin-top: 8px;
`;

/**
 * サインアップページ（新規登録）のレイアウトと状態を管理するコンポーネント
 * @param {{ initialUniversities: Array<object> }} props - サーバー(page.js)から渡される大学リスト
 */
export default function SignupPage({ initialUniversities }) {
  const router = useRouter(); // ページ遷移用

  // フォームの入力値をReactのstateで管理
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [faculties, setFaculties] = useState([]); // 学部リスト
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [error, setError] = useState(null); // エラーメッセージ用
  const [showPassword, setShowPassword] = useState(false); // パスワード表示状態

  /**
   * 大学が選択された時の処理
   * 選択された大学IDをもとに、学部リストをSupabase(クライアント)から動的に取得する
   * @param {string} universityId 選択された大学のID
   */
  const handleUniversityChange = async universityId => {
    setSelectedUniversity(universityId);
    setFaculties([]); // 学部リストをリセット
    setSelectedFaculty(""); // 学部の選択もリセット

    if (!universityId) {
      return; // 「選択してください」が選ばれた場合
    }

    try {
      // クライアント側でSupabaseに問い合わせ
      const { data, error } = await supabase
        .from("faculties")
        .select("id, name")
        .eq("university_id", universityId); // university_idが一致するものを検索

      if (error) {
        throw error;
      }
      setFaculties(data || []); // 取得した学部リストをstateにセット
    } catch (error) {
      console.error("学部リストの取得に失敗:", error);
      setError("学部の取得に失敗しました。");
    }
  };

  /**
   * パスワードの表示/非表示を切り替える関数
   */
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  /**
   * サインアップ（フォーム送信）時の処理
   * 認証ユーザーの作成と、profilesテーブルへのデータ挿入を
   * クライアント側で両方行う
   */
  const handleSubmit = async e => {
    e.preventDefault(); // フォーム送信のデフォルト動作を停止
    setError(null); // エラーをリセット

    try {
      // 1. Supabase Authでサインアップ（認証ユーザーを作成）
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) {
        throw authError; // 認証エラー
      }

      // 2. 認証が成功したら、手動で profiles テーブルに INSERT する
      // (DBトリガーが RLS と競合したため、クライアント側で処理する)
      if (authData.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id, // 認証ユーザーID
          name: name,
          university_id: selectedUniversity,
          faculty_id: selectedFaculty,
        });

        if (profileError) {
          // INSERT が失敗した場合 (RLS違反など)
          throw profileError;
        }
      } else {
        // authData.user がなぜか存在しない場合
        throw new Error(
          "サインアップ後、ユーザーデータが取得できませんでした。"
        );
      }

      /**
       * 3. サインアップ完了後、マイページに遷移
       * signIn/signUp がクッキーを書き込む処理と、
       * ページ遷移が競合するのを防ぐため、
       * 100ms 待機してからフルリロードで遷移する
       */
      setTimeout(() => {
        window.location.href = "/mypage";
      }, 100);
    } catch (error) {
      console.error("サインアップエラー:", error);
      setError(error.message || "登録中にエラーが発生しました。");
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
        />

        <PasswordInputWrapper>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="パスワード (6文字以上)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {/* 目のアイコンボタン */}
          <EyeIconButton type="button" onClick={toggleShowPassword}>
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </EyeIconButton>
        </PasswordInputWrapper>

        <Input
          type="text"
          placeholder="名前"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

        {/* 大学選択（サーバーから渡されたリスト） */}
        <Select
          value={selectedUniversity}
          onChange={e => handleUniversityChange(e.target.value)}
          required
        >
          <option value="">大学を選択してください</option>
          {initialUniversities.map(uni => (
            <option key={uni.id} value={uni.id}>
              {uni.name}
            </option>
          ))}
        </Select>

        {/* 学部選択（大学が選ばれたら動的に表示） */}
        <Select
          value={selectedFaculty}
          onChange={e => setSelectedFaculty(e.target.value)}
          required
          disabled={!selectedUniversity} // 大学が選ばれるまで非活性
        >
          <option value="">学部を選択してください</option>
          {faculties.map(fac => (
            <option key={fac.id} value={fac.id}>
              {fac.name}
            </option>
          ))}
        </Select>

        {/* エラーメッセージ */}
        {error && <ErrorMessage>{error}</ErrorMessage>}

        <SubmitButton type="submit">登録する</SubmitButton>
      </Form>
    </SignupWrapper>
  );
}
