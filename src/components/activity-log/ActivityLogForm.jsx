// 新規作成・編集フォームコンポーネント

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styled from "@emotion/styled";

// Emotionでスタイル定義

const FormContainer = styled.form`
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 24px;
`;

// 各入力項目のラッパー
const FormGroup = styled.div`
  margin-bottom: 20px;
`;

// 入力項目のラベル
const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 1rem;
`;

// 1行の入力欄 (input)
const Input = styled.input`
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
`;

// 複数行の入力欄 (textarea)
const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
  min-height: 120px;
  font-family: inherit;
`;

// 保存ボタン
const SubmitButton = styled.button`
  padding: 12px 24px;
  font-size: 1.1rem;
  font-weight: bold;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

// propsでlogToEditを受け取る（新規作成の時はundefinedになる）
export default function ActivityLogForm({ logToEdit }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // フォームのモードを判別。logToEdit があれば「編集モード」、なければ「新規モード」
  const isEditMode = Boolean(logToEdit);

  // フォームの各入力値の状態管理。編集モードなら logToEdit の値を、新規モードなら空文字を初期値にする
  const [formData, setFormData] = useState({
    name: logToEdit?.name || "",
    datetime: logToEdit?.datetime ? logToEdit.datetime.split("T")[0] : "", // 日付形式に合わせる
    reason: logToEdit?.reason || "",
    scale_size: logToEdit?.scale_size || "",
    content: logToEdit?.content || "",
    learning: logToEdit?.learning || "",
    reflection: logToEdit?.reflection || "",
  });

  // 入力欄が変わった時に、formData の状態を更新する関数
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // フォームが送信された時の処理
  const handleSubmit = async e => {
    e.preventDefault(); // ページの再読み込みを防ぐ
    setIsLoading(true);

    // 入力必須項目のチェック（例：名前と日付）
    if (!formData.name || !formData.datetime) {
      alert("活動名と活動日は必須です。");
      setIsLoading(false);
      return;
    }

    // datetimeはtimestamptz型だから、YYYY-MM-DDをYYYY-MM-DDTHH:MM:SSZみたいなISO形式に直す
    const submissionData = {
      ...formData,
      datetime: new Date(formData.datetime).toISOString(),
    };

    if (isEditMode) {
      // try...finally を使って、ローディング解除を確実に実行する
      try {
        if (isEditMode) {
          // 「編集モード」の処理
          const { error } = await supabase
            .from("activity_log")
            .update(submissionData) // フォームのデータで更新
            .eq("id", logToEdit.id); // logToEditのIDと一致するもの

          if (error) {
            throw error; // エラーを catch ブロックに投げる
          }

          alert("活動記録を更新しました！");
          // 成功したら、その記録の「詳細ページ」に戻る
          router.push(`/activity-log/${logToEdit.id}`);
          router.refresh(); // サーバーのデータを再取得させる
        } else {
          // 「新規作成モード」の処理
          const { data, error } = await supabase
            .from("activity_log")
            .insert([submissionData])
            .select()
            .single();

          if (error) {
            throw error; // エラーを catch ブロックに投げる
          }

          alert("活動記録を作成しました！");
          if (data && data.id) {
            router.push(`/activity-log/${data.id}`);
          } else {
            router.push("/activity-log");
          }
        }
      } catch (error) {
        // エラーハンドリングを共通化
        console.error("活動記録の保存に失敗:", error.message);
        alert("エラーが発生しました。");
      } finally {
        // 成功しても失敗しても、ローディングを解除する
        setIsLoading(false);
      }
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <PageTitle>
        {isEditMode ? "活動記録を編集" : "活動記録を新規作成"}
      </PageTitle>

      {/* 活動名 */}
      <FormGroup>
        <Label htmlFor="name">活動名 (必須)</Label>
        <Input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </FormGroup>

      {/* 活動日 */}
      <FormGroup>
        <Label htmlFor="datetime">活動日 (必須)</Label>
        <Input
          type="date" // HTML5の日付ピッカーを使う
          id="datetime"
          name="datetime"
          value={formData.datetime}
          onChange={handleChange}
          required
        />
      </FormGroup>

      {/* 参加した理由・目的 */}
      <FormGroup>
        <Label htmlFor="reason">参加した理由・目的</Label>
        <Textarea
          id="reason"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
        />
      </FormGroup>

      {/* 活動内容 */}
      <FormGroup>
        <Label htmlFor="content">活動内容</Label>
        <Textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
        />
      </FormGroup>

      {/* 規模・参加数 */}
      <FormGroup>
        <Label htmlFor="scale_size">活動の規模・参加数</Label>
        <Input
          type="text"
          id="scale_size"
          name="scale_size"
          value={formData.scale_size}
          onChange={handleChange}
        />
      </FormGroup>

      {/* 活動による学び */}
      <FormGroup>
        <Label htmlFor="learning">活動による学び</Label>
        <Textarea
          id="learning"
          name="learning"
          value={formData.learning}
          onChange={handleChange}
        />
      </FormGroup>

      {/* 活動の感想・反省 */}
      <FormGroup>
        <Label htmlFor="reflection">活動の感想・反省</Label>
        <Textarea
          id="reflection"
          name="reflection"
          value={formData.reflection}
          onChange={handleChange}
        />
      </FormGroup>

      {/* 保存ボタン */}
      <SubmitButton type="submit" disabled={isLoading}>
        {isLoading ? "保存中..." : isEditMode ? "更新する" : "作成する"}
      </SubmitButton>
    </FormContainer>
  );
}
