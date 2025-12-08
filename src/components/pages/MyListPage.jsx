"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import styled from "@emotion/styled";
import EventList from "../events/EventList";
import Breadcrumbs from "../common/Breadcrumbs";

import EmptyState from "../common/EmptyState";
import { FaRegHeart, FaRegCheckCircle } from "react-icons/fa";

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

  // ★ここで受け取ったpropsを変数に入れる！★
  const favoriteEvents = initialFavoriteEvents || [];
  const appliedEvents = initialAppliedEvents || [];

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

  // パンくずリスト
  const crumbs = [{ label: "マイリスト", href: "/mylist" }];
  const baseCrumb = { label: "マイページ", href: "/mypage" };

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
        {activeTab === "favorites" &&
          (favoriteEvents.length > 0 ? (
            <EventList events={favoriteEvents} source="mylist" />
          ) : (
            <EmptyState
              title="お気に入りはまだありません"
              description="気になるボランティアを見つけて、ハートマークを押してみましょう！あとで見返しやすくなります。"
              icon={<FaRegHeart />}
              actionLabel="イベントを探しに行く"
              actionHref="/"
            />
          ))}

        {activeTab === "applied" &&
          (appliedEvents.length > 0 ? (
            <EventList events={appliedEvents} source="mylist" />
          ) : (
            <EmptyState
              title="応募済みのボランティアはありません"
              description="まだ応募したイベントがないようです。興味のある活動に応募してみませんか？"
              icon={<FaRegCheckCircle />}
              actionLabel="イベントを探しに行く"
              actionHref="/"
            />
          ))}
      </EventListContainer>
    </PageContainer>
  );
}
