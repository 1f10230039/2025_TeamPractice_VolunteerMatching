// ボランティア募集管理用のイベントカードコンポーネント

"use client";

import Link from "next/link";
import styled from "@emotion/styled";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FaCalendarAlt, FaPen } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";

// カード全体（公開用の詳細ページへのリンク）
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

// カード上部（タイトルとボタン）
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

  flex-grow: 1; /* タイトルが可能な限りスペースを取るようにする */
  overflow: hidden; /* はみ出し防止 */
  text-overflow: ellipsis; /* はみ出したら省略記号に */
  display: -webkit-box; /* WebKit系ブラウザ用 */
  -webkit-line-clamp: 2; /* 最大2行まで表示 */
  -webkit-box-orient: vertical; /* 縦方向のボックスにする */
  max-height: 3.2em; /* 2行分の高さに制限 */
`;

// ボタンをまとめるコンテナ
const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0; /* タイトルに押しつぶされないようにする */
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

const EditButton = styled(BaseActionButton)`
  background-color: #f3f4f6;
  color: #555;
  border: 1px solid transparent;

  &:hover {
    background-color: #e5e7eb;
    color: #333;
  }
`;

const DeleteButton = styled(BaseActionButton)`
  background-color: #fff;
  color: #ef4444;
  border: 1px solid #fca5a5;

  &:hover {
    background-color: #fee2e2;
    color: #dc2626;
  }
`;

// イベント開始日エリア（アイコンとセットにする）
const EventDateWrapper = styled.div`
  display: flex;
  align-items: center; /* アイコンと文字の縦位置を中央揃え */
  gap: 8px; /* アイコンと文字の間隔 */
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: auto; /* カードの下部に寄せる */
  padding-top: 12px;
  border-top: 1px dashed #eee;
`;

// 日付フォーマット関数
const formatDate = dateString => {
  if (!dateString) return "日付未定";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  } catch (e) {
    return "日付形式エラー";
  }
};

export default function EventAdminCard({ event }) {
  const { id, name, start_datetime } = event;
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = e => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/volunteer-registration/admin/events/${id}/edit`);
  };

  const handleDeleteClick = async e => {
    e.stopPropagation();
    e.preventDefault();

    if (isDeleting) return;

    const confirmed = window.confirm(
      `「${name}」を本当に削除しますか？\nこの操作は元に戻せません。`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      alert("イベントを削除しました。");
      router.refresh();
    } catch (error) {
      console.error("イベントの削除に失敗:", error.message);
      alert("エラーが発生しました。");
    } finally {
      setIsDeleting(false);
    }
  };

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
