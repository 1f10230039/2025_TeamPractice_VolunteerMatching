"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import styled from "@emotion/styled";
import EventList from "../events/EventList";
import Breadcrumbs from "../common/Breadcrumbs";

// Emotion
// ページ全体のコンテナ
const PageContainer = styled.div`
  padding-bottom: 24px;
`;

// タブを囲むコンテナ
const TabContainer = styled.div`
  display: flex;
  background-color: #97cdf3;
  border-bottom: 2px solid #eee;
  margin-bottom: 24px;
`;

// タブのボタン
const TabButton = styled.button`
  padding: 12px 24px;
  font-size: 1.1rem;
  font-weight: bold;
  border: none;
  background-color: transparent;
  cursor: pointer;
  color: ${props => (props.isActive ? "#007bff" : "#888")};
  border-bottom: ${props =>
    props.isActive ? "3px solid #007bff" : "3px solid transparent"};
  margin-bottom: -2px;

  &:hover {
    color: #007bff;
  }
`;

// イベントリスト全体のコンテナ
const EventListContainer = styled.div`
  padding: 0 24px;
`;

/**
 * マイリストページコンポーネント
 * @param  {{ initialFavoriteEvents: object[], initialAppliedEvents: object[] }} props - page.jsから渡される初期データ
 */
export default function MyListPage({
  initialFavoriteEvents,
  initialAppliedEvents,
}) {
  const searchParams = useSearchParams(); // URLのパラメータを取得するフック

  // URLに "?tab=applied" があったら、初期値を "applied" にする
  // なければ "favorites" にする
  const defaultTab =
    searchParams.get("tab") === "applied" ? "applied" : "favorites";

  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "applied" || tab === "favorites") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <PageContainer>
      <TabContainer>
        <TabButton
          isActive={activeTab === "favorites"}
          onClick={() => setActiveTab("favorites")}
        >
          お気に入り
        </TabButton>
        <TabButton
          isActive={activeTab === "applied"}
          onClick={() => setActiveTab("applied")}
        >
          応募済み
        </TabButton>
      </TabContainer>

      <div>
        {activeTab === "favorites" && (
          <EventList events={initialFavoriteEvents} source="mylist" />
        )}

        {activeTab === "applied" && (
          <EventList events={initialAppliedEvents} source="mylist" />
        )}
      </div>
    </PageContainer>
  );
}
