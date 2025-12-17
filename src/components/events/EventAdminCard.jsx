// ボランティア募集管理用のイベントカードコンポーネント

"use client";

import Link from "next/link";
import styled from "@emotion/styled";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FaCalendar } from "react-icons/fa";

// カード全体（公開用の詳細ページへのリンク）
const CardContainer = styled(Link)`
  display: block;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 12px;
  background-color: #fff;
  text-decoration: none;
  color: inherit;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-4px);
  }
`;

// カード上部（タイトルとボタン）
const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 16px;
`;

// ボランティア名
const EventName = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
  flex-grow: 1;
`;

// ボタンをまとめるコンテナ
const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-shrink: 0;
`;

// 編集ボタン
const EditButton = styled.button`
  padding: 6px 12px;
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #ddd;
  }
`;

// 削除ボタン
const DeleteButton = styled.button`
  padding: 6px 12px;
  background-color: #fff;
  color: #ff4d4d;
  border: 1px solid #ff4d4d;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #ff4d4d;
    color: white;
  }
`;

// イベント開始日
const EventDate = styled.p`
  font-size: 0.95rem;
  color: #555;
  margin: 0;
  font-weight: 500;

  &::before {
    content: "🗓️";
    margin-right: 8px;
  }
`;

// 日付フォーマット関数
const formatDate = dateString => {
  if (!dateString) return "日付未定";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    return "日付形式エラー";
  }
};

export default function EventAdminCard({ event }) {
  const { id, name, start_datetime } = event;
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false); // 削除中ローディング

  // 編集ボタンが押された時の処理
  const handleEditClick = e => {
    e.stopPropagation(); // 親のLinkが動かないように
    e.preventDefault();
    // 管理画面の編集ページに飛ばす
    router.push(`/volunteer-registration/admin/events/${id}/edit`);
  };

  // 削除ボタンが押された時の処理
  const handleDeleteClick = async e => {
    e.stopPropagation(); // 親のLinkが動かないように
    e.preventDefault();

    if (isDeleting) return;

    const confirmed = window.confirm(
      `「${name}」を本当に削除しますか？\nこの操作は元に戻せません。`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      // Supabaseから "events" テーブルのデータを削除
      const { error } = await supabase.from("events").delete().eq("id", id);

      if (error) {
        throw error;
      }

      alert("イベントを削除しました。");
      // 削除が成功したら、一覧ページをリフレッシュして、サーバーにデータを再取得させる
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
        <EventName>{name || "無題のイベント"}</EventName>

        <ButtonContainer>
          <EditButton onClick={handleEditClick}>編集</EditButton>
          <DeleteButton onClick={handleDeleteClick} disabled={isDeleting}>
            {isDeleting ? "削除中..." : "削除"}
          </DeleteButton>
        </ButtonContainer>
      </CardHeader>

      <EventDate>{formatDate(start_datetime)}</EventDate>
    </CardContainer>
  );
}
