"use client";

import { useState } from "react";
import styled from "@emotion/styled";
import EventList from "../events/EventList";

// --- Emotion Styles ---
const PageContainer = styled.div`
  padding-bottom: 24px;
`;

const TabContainer = styled.div`
  display: flex;
  background-color: #97cdf3;
  border-bottom: 2px solid #eee;
  margin-bottom: 24px;
`;

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

const EventListContainer = styled.div`
  padding: 0 24px;
`;

/**
 * マイリストページの表示コンポーネント (UI担当)
 * Containerからデータを受け取り、タブ切り替えとリスト表示を行う
 *
 * @param {object} props
 * @param {object[]} props.initialFavoriteEvents - お気に入りイベント一覧
 * @param {object[]} props.initialAppliedEvents - 応募済みイベント一覧
 * @param {number[]} props.userFavoriteIds - ハート判定用のIDリスト
 */
export default function MyListPage({
  initialFavoriteEvents,
  initialAppliedEvents,
  userFavoriteIds = [],
}) {
  const [activeTab, setActiveTab] = useState("favorites");

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

      <EventListContainer>
        {/* お気に入りタブの内容 */}
        {activeTab === "favorites" && (
          <EventList
            events={initialFavoriteEvents}
            source="mylist"
            userFavoriteIds={userFavoriteIds} // EventListへバケツリレー
          />
        )}

        {/* 応募済みタブの内容 */}
        {activeTab === "applied" && (
          <EventList
            events={initialAppliedEvents}
            source="mylist"
            userFavoriteIds={userFavoriteIds} // 応募済みタブでもハートの状態を反映
          />
        )}
      </EventListContainer>
    </PageContainer>
  );
}
