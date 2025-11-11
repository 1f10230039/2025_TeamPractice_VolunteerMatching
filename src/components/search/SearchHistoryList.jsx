// 検索履歴リストコンポーネント
"use client";

import Link from "next/link";
import styled from "@emotion/styled";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FaHistory, FaTimes } from "react-icons/fa";

// 履歴リスト全体
const HistoryListContainer = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
`;

// 履歴の1行1行
const HistoryItemContainer = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

// 履歴の「リンク部分」 (アイコン + テキスト)
const HistoryLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 14px 16px;
  text-decoration: none;
  color: #333;
  flex-grow: 1;
  transition: background-color 0.2s ease;
  gap: 12px;

  &:hover {
    background-color: #f9f9f9;
  }

  & > svg {
    width: 1rem;
    height: 1rem;
    color: #888;
  }
`;

// 履歴の「削除ボタン」部分
const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: #aaa;
  cursor: pointer;
  padding: 0 16px;
  align-self: stretch;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #ff4d4d;
  }

  & > svg {
    width: 1rem;
    height: 1rem;
  }
`;

// 履歴がない時に表示するメッセージ
const NoHistoryText = styled.p`
  color: #888;
  padding: 16px;
  text-align: center;
`;

export default function SearchHistoryList({ history }) {
  // サーバーからの履歴を初期値として状態を持つ
  const [historyItems, setHistoryItems] = useState(history || []);
  const [isDeleting, setIsDeleting] = useState(false); // 連打防止

  // 削除ボタンが押された時の関数
  const handleDelete = async (e, deleteId) => {
    // リンクが動かないようにする
    e.preventDefault();
    e.stopPropagation();

    if (isDeleting) return;
    setIsDeleting(true);

    // Supabaseからデータを削除
    const { error } = await supabase
      .from("search_history")
      .delete()
      .eq("id", deleteId);

    if (error) {
      console.error("履歴の削除に失敗:", error.message);
    } else {
      // データベースの削除が成功したら、画面の状態(historyItems) も更新する
      setHistoryItems(currentItems =>
        currentItems.filter(item => item.id !== deleteId)
      );
    }

    setIsDeleting(false);
  };

  // 履歴が 0件 の場合
  if (!historyItems || historyItems.length === 0) {
    return <NoHistoryText>検索履歴はありません。</NoHistoryText>;
  }

  // 履歴がある場合
  return (
    <HistoryListContainer>
      {historyItems.map(item => (
        <HistoryItemContainer key={item.id}>
          <HistoryLink
            href={`/search/keyword-results?q=${encodeURIComponent(item.query)}`}
          >
            <FaHistory />
            {item.query}
          </HistoryLink>
          <DeleteButton
            onClick={e => handleDelete(e, item.id)}
            disabled={isDeleting}
            aria-label="履歴を削除"
          >
            <FaTimes />
          </DeleteButton>
        </HistoryItemContainer>
      ))}
    </HistoryListContainer>
  );
}
