"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import styled from "@emotion/styled";
import EventList from "../events/EventList";

import EmptyState from "../common/EmptyState";
import { FaRegHeart, FaRegCheckCircle } from "react-icons/fa";

// --- Emotion Styles ---

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #f5fafc; /* マイページと統一した背景色 */
  padding-bottom: 150px;
  font-family: "Helvetica Neue", Arial, sans-serif;
`;

const ContentWrapper = styled.div`
  max-width: 1000px; /* 横幅を少し広めに */
  margin: 0 auto;
  padding: 0 20px;
`;

// ヘッダーエリア
const HeaderArea = styled.div`
  padding: 20px 0 12px 0;
  text-align: center;
`;

// タブを囲むコンテナ
const TabContainer = styled.div`
  display: inline-flex;
  background-color: #fff;
  padding: 12px;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(122, 211, 232, 0.15);
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
`;

// タブボタン
const TabButton = styled.button`
  padding: 12px 32px;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  align-items: center;
  gap: 12px;
  outline: none;

  /* アイコン */
  & svg {
    font-size: 1.1em;
  }

  /* ★ アクティブ時のスタイル ★ */
  ${props =>
    props.isActive
      ? `
    background: linear-gradient(135deg, #68B5D5 0%, #4A90E2 100%);
    color: white;
    box-shadow: 0 4px 10px rgba(74, 144, 226, 0.3);
    transform: translateY(-1px);
  `
      : `
    /* 非アクティブ時のスタイル */
    background-color: transparent;
    color: #888;
    
    &:hover {
      background-color: #f0f8ff;
      color: #5796C2;
    }
  `}

  @media (max-width: 600px) {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
`;

// イベントリスト全体のコンテナ
const EventListContainer = styled.div``;

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
      <ContentWrapper>
        <HeaderArea>
          <br />
          <TabContainer>
            <TabButton
              isActive={activeTab === "favorites"}
              onClick={() => setActiveTab("favorites")}
            >
              <FaRegHeart />
              お気に入り
            </TabButton>
            <TabButton
              isActive={activeTab === "applied"}
              onClick={() => setActiveTab("applied")}
            >
              <FaRegCheckCircle />
              応募済み
            </TabButton>
          </TabContainer>
        </HeaderArea>

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
      </ContentWrapper>
    </PageContainer>
  );
}
