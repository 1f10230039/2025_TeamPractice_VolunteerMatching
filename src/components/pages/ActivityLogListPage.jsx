// 活動記録一覧ページのコンポーネント
"use client";

import Link from "next/link";
import styled from "@emotion/styled";
import ActivityLogCard from "../activity-log/ActivityLogCard";
import { FaPlus, FaPenFancy } from "react-icons/fa";
import Breadcrumbs from "../common/Breadcrumbs";
import EmptyState from "../common/EmptyState";

// --- Emotion Styles ---
const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: #f5fafc;
  padding-bottom: 150px;
  font-family: "Helvetica Neue", Arial, sans-serif;
`;

const ContentContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
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
  color: #333;
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
const LogListContainer = styled.div`
  display: grid;
  gap: 24px;

  grid-template-columns: 1fr;

  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export default function ActivityLogListPage({ initialLogs }) {
  const logs = initialLogs || [];

  // パンくずリスト用データ
  const crumbs = [{ label: "活動の記録", href: "/activity-log" }];
  const baseCrumb = { label: "マイページ", href: "/mypage" };

  return (
    <PageWrapper>
      <Breadcrumbs crumbs={crumbs} baseCrumb={baseCrumb} />

      <ContentContainer>
        <HeaderArea>
          <PageTitle>活動の記録</PageTitle>
          <CreateButton href="/activity-log/new">
            <FaPlus /> 新規作成
          </CreateButton>
        </HeaderArea>

        <LogListContainer>
          {logs.length > 0 ? (
            logs.map(log => <ActivityLogCard key={log.id} log={log} />)
          ) : (
            <div style={{ gridColumn: "1 / -1" }}>
              <EmptyState
                title="活動記録がありません"
                description="ボランティアに参加したら、活動の思い出や学びをここに記録していきましょう！"
                icon={<FaPenFancy />}
                actionLabel="記録を作成する"
                actionHref="/activity-log/new"
              />
            </div>
          )}
        </LogListContainer>
      </ContentContainer>
    </PageWrapper>
  );
}
