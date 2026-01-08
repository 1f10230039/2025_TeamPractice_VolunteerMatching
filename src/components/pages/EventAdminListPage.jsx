// ボランティア募集管理のイベント一覧ページコンポーネント
"use client";

import Link from "next/link";
import styled from "@emotion/styled";
import EventAdminCard from "../events/EventAdminCard";
import Breadcrumbs from "../common/Breadcrumbs";
import EmptyState from "../common/EmptyState";
import { FaPlus, FaClipboardList } from "react-icons/fa";

// --- Emotion Styles ---
const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: #f5fafc;
  padding-bottom: 60px;
  font-family: "Helvetica Neue", Arial, sans-serif;
`;

// パンくずリストを固定するためのラッパー
const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #f5fafc;
`;

const ContentContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
  @media (max-width: 600px) {
    padding-bottom: 100px;
  }
`;

// ヘッダーエリア
const HeaderArea = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40px 0 32px 0;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 800;
  margin: 0;
  @media (max-width: 600px) {
    font-size: 22px;
  }
`;

// 新規作成ボタン
const CreateButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #68b5d5 0%, #4a90e2 100%);
  color: white;
  text-decoration: none;
  border-radius: 30px;
  font-weight: bold;
  font-size: 0.95rem;
  box-shadow: 0 4px 10px rgba(74, 144, 226, 0.3);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(74, 144, 226, 0.4);
    filter: brightness(1.05);
  }

  &:active {
    transform: translateY(0);
  }

  & > svg {
    font-size: 1rem;
  }
`;

// カードリストのグリッドレイアウト
const ListContainer = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;

  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

// サーバーから渡された初期データを受け取る
export default function EventAdminListPage({ events }) {
  const safeEvents = events || [];

  // パンくずリスト用データ
  const crumbs = [
    { label: "ボランティア管理", href: "/volunteer-registration/admin/events" },
  ];
  const baseCrumb = { label: "マイページ", href: "/mypage" };

  return (
    <PageWrapper>
      <StickyHeader>
        <Breadcrumbs crumbs={crumbs} baseCrumb={baseCrumb} />
      </StickyHeader>

      <ContentContainer>
        <HeaderArea>
          <PageTitle>ボランティア管理</PageTitle>
          <CreateButton href="/volunteer-registration/admin/events/new">
            <FaPlus /> 新規登録
          </CreateButton>
        </HeaderArea>

        {/* ボランティアカードの一覧 */}
        <ListContainer>
          {safeEvents.length > 0 ? (
            safeEvents.map(event => (
              // eventデータを丸ごと渡す
              <EventAdminCard key={event.id} event={event} />
            ))
          ) : (
            // 登録がない場合は EmptyState を表示
            <div style={{ gridColumn: "1 / -1" }}>
              <EmptyState
                title="登録されたボランティアはありません"
                description="新しいボランティア活動を登録して、参加者を募集しましょう！"
                icon={<FaClipboardList />}
                actionLabel="新規登録する"
                actionHref="/volunteer-registration/admin/events/new"
              />
            </div>
          )}
        </ListContainer>
      </ContentContainer>
    </PageWrapper>
  );
}
