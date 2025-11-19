// 活動記録カードコンポーネント

"use client";

import Link from "next/link";
import styled from "@emotion/styled";
import { useRouter } from "next/navigation";
import { FaCalendarAlt } from "react-icons/fa";

// カード全体（詳細ページへのリンク）
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

// カード上部（タイトルと編集ボタン）
const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

// ボランティア名
const ActivityName = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
  flex-grow: 1;
  padding-right: 16px;
`;

// 編集ボタン
const EditButton = styled.button`
  padding: 6px 12px;
  background-color: #f0f0f0;
  color: #333;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  flex-shrink: 0;
  transition: background-color 0.2s ease;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #ddd;
  }
`;

// カード下部（日付）
const ActivityDate = styled.p`
  font-size: 0.95rem;
  color: #555;
  margin: 0;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;

  & > svg {
    width: 0.95rem;
    height: 0.95rem;
    color: #888;
  }
`;

// 日付を「YYYY年MM月DD日」にフォーマットする関数
const formatDate = dateString => {
  if (!dateString) return "日付未定";
  try {
    const date = new Date(dateString);
    // 日本のロケールで、年月日を指定
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    return "日付形式エラー";
  }
};

export default function ActivityLogCard({ log }) {
  // logデータから必要なものを取り出す
  const { id, name, datetime } = log;
  const router = useRouter();

  const handleEditClick = e => {
    // 親の Link (CardContainer) が動かないようにする
    e.stopPropagation();
    e.preventDefault(); // button のデフォルトの動作も止める
    // 手動で編集ページに飛ばす
    router.push(`/activity-log/${id}/edit`);
  };

  return (
    <CardContainer href={`/activity-log/${id}`}>
      <CardHeader>
        <ActivityName>{name || "無題の活動"}</ActivityName>
        <EditButton onClick={handleEditClick}>編集</EditButton>
      </CardHeader>

      <ActivityDate>
        <FaCalendarAlt />
        {formatDate(datetime)}
      </ActivityDate>
    </CardContainer>
  );
}
