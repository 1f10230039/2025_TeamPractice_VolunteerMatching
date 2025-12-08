// ボランティア募集管理のイベント一覧ページコンポーネント

"use client";

import Link from "next/link";
import styled from "@emotion/styled";
import EventAdminCard from "../events/EventAdminCard";

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
`;

// カードを並べるリストコンテナ
const ListContainer = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;
`;

// サーバーから渡された初期データを受け取る
export default function EventAdminListPage({ events }) {
  const safeEvents = events || [];

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>ボランティア管理</PageTitle>
        {/* 新規作成ボタン (入力ページへ飛ぶ) */}
        <CreateButton href="/volunteer-registration/admin/events/new">
          ＋ 新規登録
        </CreateButton>
      </PageHeader>

      {/* ボランティアカードの一覧 */}
      <ListContainer>
        {safeEvents.length > 0 ? (
          safeEvents.map(event => (
            // eventデータを丸ごと渡す
            <EventAdminCard key={event.id} event={event} />
          ))
        ) : (
          <p>登録されているボランティアはありません。</p>
        )}
      </ListContainer>
    </PageContainer>
  );
}
