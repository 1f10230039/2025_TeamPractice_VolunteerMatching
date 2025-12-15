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

  /* ホバー時の動き */
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border-color: #e0eafc;
  }

  /* 左側にアクセントカラーのラインを入れる */
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

  /* 長すぎる場合は省略 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

// 抜粋テキスト (理由などを少し見せる)
const Excerpt = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  line-height: 1.6;

  display: -webkit-box;
  -webkit-line-clamp: 2; /* 2行まで表示 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  opacity: 0.8;
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

export default function ActivityLogCard({ log }) {
  const { id, name, datetime, reason } = log;
  const router = useRouter();

  // カード全体をクリックした時の遷移
  const handleCardClick = () => {
    router.push(`/activity-log/${id}`);
  };

  // 編集ボタンをクリックした時の遷移
  const handleEditClick = e => {
    e.stopPropagation(); // 親のクリックイベントを止める
    router.push(`/activity-log/${id}/edit`);
  };

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
