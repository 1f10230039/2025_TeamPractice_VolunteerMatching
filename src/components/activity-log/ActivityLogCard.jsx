// 活動ログカードコンポーネント
"use client";

import styled from "@emotion/styled";
import { useRouter } from "next/navigation";
import { FaCalendarAlt, FaPen } from "react-icons/fa";

// --- Emotion Styles ---
// カード全体
const CardContainer = styled.div`
  position: relative;
  background-color: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border-color: #e0eafc;
  }

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 8px;
    background: linear-gradient(to bottom, #68b5d5, #4a90e2);
  }
`;

// 上部エリア（日付と編集ボタン）
const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

// 日付バッジ
const DateBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #f0f8ff;
  color: #4a90e2;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;

  & svg {
    font-size: 0.9rem;
  }
`;

// 編集ボタン
const EditButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f5f5f5;
  color: #888;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;

  &:hover {
    background-color: #e0eafc;
    color: #4a90e2;
    transform: scale(1.1);
  }
`;

// 活動名
const ActivityName = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

// 抜粋テキスト
const Excerpt = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  opacity: 0.8;
`;

// 日付フォーマット関数
const formatDate = dateString => {
  // もし日付文字列が無ければ「日付未定」を返す
  if (!dateString) return "日付未定";
  // 日付文字列をパースして日本語形式で返す
  try {
    const date = new Date(dateString);
    // toLocaleDateStringを使って日本語形式に変換
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
    });
    // 例: 2024年5月20日(月)
  } catch (e) {
    // エラー時は元の文字列を返す
    return "日付形式エラー";
  }
};

// --- Component ---
// 活動ログカードコンポーネント本体
export default function ActivityLogCard({ log }) {
  // logオブジェクトから必要な情報を取得
  const { id, name, datetime, reason } = log;
  // ルーター取得
  const router = useRouter();

  // カード全体をクリックした時の遷移
  const handleCardClick = () => {
    // 活動ログ詳細ページへ遷移
    router.push(`/activity-log/${id}`);
  };

  // 編集ボタンをクリックした時の遷移
  const handleEditClick = e => {
    // クリックイベントの伝播を防止（カード全体のクリックイベントを発火させない）
    e.stopPropagation();
    // 活動ログ編集ページへ遷移
    router.push(`/activity-log/${id}/edit`);
  };

  // コンポーネントの描画
  return (
    <CardContainer onClick={handleCardClick}>
      <CardHeader>
        <DateBadge>
          <FaCalendarAlt />
          {formatDate(datetime)}
        </DateBadge>

        <EditButton onClick={handleEditClick} aria-label="編集する">
          <FaPen size={14} />
        </EditButton>
      </CardHeader>

      <ActivityName>{name || "無題の活動"}</ActivityName>

      {/* 理由があれば、少しだけプレビュー表示 */}
      {reason && <Excerpt>{reason}</Excerpt>}
    </CardContainer>
  );
}
