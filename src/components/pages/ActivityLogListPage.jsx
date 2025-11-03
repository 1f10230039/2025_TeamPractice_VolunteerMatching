// 活動記録一覧ページのコンポーネント

"use client";

import Link from "next/link";
import styled from "@emotion/styled";
import ActivityLogCard from "../activity-log/ActivityLogCard";
import { FaPlus } from "react-icons/fa";

// ページ全体のコンテナ
const PageContainer = styled.div`
  padding: 24px;
`;

// ページ上部のヘッダー（タイトルとボタン）
const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
`;

// 新規作成ボタン（Linkをボタン風にスタイリング）
const CreateButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;

  padding: 10px 16px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #0056b3;
  }

  & > svg {
    width: 0.9em;
    height: 0.9em;
  }
`;

// カードを並べるリストコンテナ
const LogListContainer = styled.div`
  display: grid;
  gap: 20px;
  /* 1列で表示（スマホ） */
  grid-template-columns: 1fr;

  /* pcサイズ */
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

// サーバーから渡された初期データを受け取る
export default function ActivityLogListPage({ initialLogs }) {
  const logs = initialLogs || [];

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>活動の記録</PageTitle>
        {/* 新規作成ボタン (入力ページへ飛ぶ) */}
        <CreateButton href="/activity-log/new">
          <FaPlus /> 新規作成
        </CreateButton>
      </PageHeader>

      {/* 活動記録カードの一覧 */}
      <LogListContainer>
        {logs.length > 0 ? (
          logs.map(log => (
            // logデータを丸ごと渡す
            <ActivityLogCard key={log.id} log={log} />
          ))
        ) : (
          <p>活動記録はまだありません。</p>
        )}
      </LogListContainer>
    </PageContainer>
  );
}
