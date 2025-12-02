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
 *
 * @param {object} props
 * @param {object[]} props.initialFavoriteEvents - お気に入りイベントのリスト
 * @param {object[]} props.initialAppliedEvents - 応募済みイベントのリスト
 * @param {number[]} props.userFavoriteIds - ★追加: お気に入り済みイベントIDのリスト
 */
export default function MyListPage({
  initialFavoriteEvents,
  initialAppliedEvents,
  userFavoriteIds, // ★ Containerから受け取る
}) {
  // タブの切り替え状態 ("favorites" or "applied")
  const [activeTab, setActiveTab] = useState("favorites");

  // propsで受け取ったデータをそのまま使用
  const favoriteEvents = initialFavoriteEvents;
  const appliedEvents = initialAppliedEvents;

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
            events={favoriteEvents}
            source="mylist"
            userFavoriteIds={userFavoriteIds} // ★ EventListに渡す (これでハートが赤くなる)
          />
        )}

        {/* 応募済みタブの内容 */}
        {activeTab === "applied" && (
          <EventList
            events={appliedEvents}
            source="mylist"
            userFavoriteIds={userFavoriteIds} // ★ 応募済みリストの中でも、お気に入り済みのものは赤くする
          />
        )}
      </EventListContainer>
    </PageContainer>
  );
}
