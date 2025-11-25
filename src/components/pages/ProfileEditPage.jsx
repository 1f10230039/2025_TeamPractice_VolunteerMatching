"use client";

import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

// --- Emotion Style Definitions ---

const Wrapper = styled.div`
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 12px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #555;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
`;

const SubmitButton = styled.button`
  flex: 1;
  background-color: #28a745;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    background-color: #218838;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    background-color: #5a6268;
  }
`;

/**
 * プロフィール編集フォームコンポーネント
 *
 * 役割:
 * 1. ユーザーからの入力を受け付ける (フォーム)
 * 2. 大学選択に応じて学部リストを動的に取得する
 * 3. 変更内容をSupabaseに保存(UPDATE)する
 *
 * @param {object} initialProfile - Containerから渡された現在のプロフィール
 * @param {object[]} universities - Containerから渡された大学リスト
 */
export default function ProfileEditPage({ initialProfile, universities }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // フォーム入力値の管理 (初期値は渡されたプロフィールデータ)
  const [name, setName] = useState(initialProfile?.name || "");
  const [selectedUniversity, setSelectedUniversity] = useState(
    initialProfile?.university_id || ""
  );
  const [selectedFaculty, setSelectedFaculty] = useState(
    initialProfile?.faculty_id || ""
  );

  // 学部リスト (大学が選択されると中身が変わる)
  const [faculties, setFaculties] = useState([]);

  /**
   * 指定された大学IDに紐づく学部リストを取得する関数
   * @param {string} uniId - 大学ID
   */
  const fetchFaculties = async uniId => {
    if (!uniId) {
      setFaculties([]);
      return;
    }
    const { data } = await supabase
      .from("faculties")
      .select("id, name")
      .eq("university_id", uniId);
    setFaculties(data || []);
  };

  /**
   * 初期表示時の処理
   * すでに大学が設定されていたら、その大学の学部リストを取得して表示する
   */
  useEffect(() => {
    if (selectedUniversity) {
      fetchFaculties(selectedUniversity);
    }
  }, []);

  /**
   * 大学が変更された時の処理
   */
  const handleUniversityChange = e => {
    const uniId = e.target.value;
    setSelectedUniversity(uniId);
    setSelectedFaculty(""); // 大学が変わったら学部選択はリセット
    fetchFaculties(uniId); // 新しい大学の学部リストを取得
  };

  /**
   * フォーム送信（保存）時の処理
   */
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      // Supabaseに対して更新リクエスト(UPDATE)を送る
      const { error } = await supabase
        .from("profiles")
        .update({
          name: name,
          university_id: selectedUniversity,
          faculty_id: selectedFaculty,
        })
        .eq("id", initialProfile.id); // 更新対象は自分のID

      if (error) throw error;

      // 成功時の処理
      alert("プロフィールを更新しました！");
      router.refresh(); // 画面のキャッシュを更新
      window.location.href = "/mypage"; // マイページへ戻る
    } catch (error) {
      console.error("更新エラー:", error);
      alert("更新に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Title>プロフィール編集</Title>
      <Form onSubmit={handleSubmit}>
        {/* 名前入力 */}
        <FormGroup>
          <Label>名前</Label>
          <Input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </FormGroup>

        {/* 大学選択 */}
        <FormGroup>
          <Label>大学</Label>
          <Select
            value={selectedUniversity}
            onChange={handleUniversityChange}
            required
          >
            <option value="">選択してください</option>
            {universities.map(uni => (
              <option key={uni.id} value={uni.id}>
                {uni.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        {/* 学部選択 (大学を選ぶまで選べない) */}
        <FormGroup>
          <Label>学部</Label>
          <Select
            value={selectedFaculty}
            onChange={e => setSelectedFaculty(e.target.value)}
            required
            disabled={!selectedUniversity}
          >
            <option value="">選択してください</option>
            {faculties.map(fac => (
              <option key={fac.id} value={fac.id}>
                {fac.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        {/* ボタンエリア */}
        <ButtonGroup>
          <CancelButton type="button" onClick={() => router.back()}>
            キャンセル
          </CancelButton>
          <SubmitButton type="submit" disabled={loading}>
            {loading ? "更新中..." : "更新する"}
          </SubmitButton>
        </ButtonGroup>
      </Form>
    </Wrapper>
  );
}
