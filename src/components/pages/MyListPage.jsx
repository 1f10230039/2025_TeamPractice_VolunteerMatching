// マイリストページコンポーネント
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import styled from "@emotion/styled";
import EventList from "../events/EventList";
import EmptyState from "../common/EmptyState";
import { FaRegHeart, FaRegCheckCircle, FaArrowUp } from "react-icons/fa";

// --- Emotion Styles ---
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #f5fafc;
  padding-bottom: 150px;
  font-family: "Helvetica Neue", Arial, sans-serif;
`;

const ContentWrapper = styled.div`
  max-width: 1000px;
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

  & svg {
    font-size: 1.1em;
  }

  ${props =>
    props.isActive
      ? `
    background-color: #e6f4ff; 
    color: #007bff;
    box-shadow: none; 
    transform: none;
    /* border: 1px solid #b3d7ff; */

    & > svg {
      color: #007bff;
    }
  `
      : `
    background-color: transparent;
    color: #666;

    &:hover {
      background-color: #f0f8ff; /* 薄い青 */
      color: #007bff;
      transform: translateY(-1px);
      
      & > svg {
        color: #007bff;
      }
    }
  `}

  &:active {
    transform: translateY(0);
    filter: brightness(0.95);
  }

  & > svg {
    width: 1.1rem;
    height: 1.1rem;
    transition: color 0.3s ease;
    color: ${props => (props.isActive ? "#007bff" : "#999")};
  }

  @media (max-width: 600px) {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
`;

// トップへ戻るボタンのスタイル
const ScrollTopButton = styled.button`
  position: fixed;
  bottom: 30px;
  width: 50px;
  height: 50px;
  background: white;
  color: #888;
  border: none;
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
  cursor: pointer;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  opacity: ${props => (props.show ? 1 : 0)};
  transform: translateY(${props => (props.show ? 0 : "20px")});
  pointer-events: ${props => (props.show ? "auto" : "none")};
  right: 30px;

  @media (min-width: 1160px) {
    right: auto;
    left: calc(50% + 500px + 30px);
  }

  &:hover {
    color: #4a90e2;
    box-shadow: 0 6px 20px rgba(74, 144, 226, 0.5);
    transform: translateY(-5px);
  }

  &:hover svg {
    animation: bounce 1s infinite;
  }

  @keyframes bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-5px);
    }
    60% {
      transform: translateY(-3px);
    }
  }

  @media (max-width: 600px) {
    width: 44px;
    height: 44px;
    bottom: 120px;
    right: 20px;
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
  const favoriteEvents = initialFavoriteEvents || [];
  const appliedEvents = initialAppliedEvents || [];
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  useEffect(() => {
    const handleScrollTopVisibility = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScrollTopVisibility);
    return () =>
      window.removeEventListener("scroll", handleScrollTopVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

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
                actionLabel="ボランティアを探しに行く"
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
                actionLabel="ボランティアを探しに行く"
                actionHref="/"
              />
            ))}
        </EventListContainer>
      </ContentWrapper>

      <ScrollTopButton
        show={showScrollTop}
        onClick={scrollToTop}
        aria-label="トップへ戻る"
      >
        <FaArrowUp />
      </ScrollTopButton>
    </PageContainer>
  );
}
