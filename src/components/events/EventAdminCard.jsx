// ボランティア募集管理用のイベントカードコンポーネント
"use client";

import Link from "next/link";
import styled from "@emotion/styled";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FaCalendarAlt, FaPen } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";

// カード全体
const CardContainer = styled(Link)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background-color: #fff;
  text-decoration: none;
  color: inherit;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease,
    border-color 0.2s ease;
  height: 100%;

  &:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
    transform: translateY(-4px);
    border-color: #b0c4de;
  }
`;

// カード上部
const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;
`;

// ボランティア名
const EventName = styled.h3`
  font-size: 1.15rem;
  font-weight: bold;
  margin: 0;
  color: #333;
  line-height: 1.4;

  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  max-height: 3.2em;
`;

// ボタンをまとめるコンテナ
const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

// 共通ボタンスタイル
const BaseActionButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
`;

// 編集ボタン
const EditButton = styled(BaseActionButton)`
  background-color: #f3f4f6;
  color: #555;
  border: 1px solid transparent;

  &:hover {
    background-color: #e5e7eb;
    color: #333;
  }
`;

// 削除ボタン
const DeleteButton = styled(BaseActionButton)`
  background-color: #fff;
  color: #ef4444;
  border: 1px solid #fca5a5;

  &:hover {
    background-color: #fee2e2;
    color: #dc2626;
  }
`;

// イベント開始日エリア
const EventDateWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px dashed #eee;
`;

// 日付フォーマット関数
const formatDate = dateString => {
  // もし日付がなければ「日付未定」を返す
  if (!dateString) return "日付未定";
  // 日付オブジェクトを作成して日本語形式でフォーマット
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
    });
    // 例: 2024年5月20日(月)
  } catch (e) {
    return "日付形式エラー";
  }
};

// イベント管理用カードコンポーネント
export default function EventAdminCard({ event }) {
  // イベント情報を取得
  const { id, name, start_datetime } = event;
  // ルーターを取得
  const router = useRouter();
  // 削除中フラグ
  const [isDeleting, setIsDeleting] = useState(false);

  // 編集ボタンクリック時の処理
  const handleEditClick = e => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/volunteer-registration/admin/events/${id}/edit`);
  };

  // 削除ボタンクリック時の処理
  const handleDeleteClick = async e => {
    e.stopPropagation();
    e.preventDefault();

    // もし削除中なら何もしない
    if (isDeleting) return;

    // 確認ダイアログを表示
    const confirmed = window.confirm(
      `「${name}」を本当に削除しますか？\nこの操作は元に戻せません。`
    );

    // もしキャンセルされたら終了
    if (!confirmed) return;

    // 削除処理を実行
    setIsDeleting(true);
    // Supabaseからイベントを削除
    try {
      // イベント削除APIを呼び出す
      const { error } = await supabase.from("events").delete().eq("id", id);
      // もしエラーがあれば例外を投げる
      if (error) throw error;
      alert("イベントを削除しました。");
      router.refresh();
    } catch (error) {
      console.error("イベントの削除に失敗:", error.message);
      alert("エラーが発生しました。");
      // エラー処理はここに追加
    } finally {
      setIsDeleting(false);
    }
  };

  // レンダリング
  return (
    <CardContainer href={`/events/${id}?source=admin`}>
      <CardHeader>
        <EventName title={name}>{name || "無題のイベント"}</EventName>

        <ButtonContainer>
          <EditButton onClick={handleEditClick}>
            <FaPen size={12} /> 編集
          </EditButton>
          <DeleteButton onClick={handleDeleteClick} disabled={isDeleting}>
            {isDeleting ? "..." : <FiTrash2 size={12} />} 削除
          </DeleteButton>
        </ButtonContainer>
      </CardHeader>

      <EventDateWrapper>
        <FaCalendarAlt size={16} />
        <span>{formatDate(start_datetime)}</span>
      </EventDateWrapper>
    </CardContainer>
  );
}
