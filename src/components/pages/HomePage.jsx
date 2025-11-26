"use client";

import { useState, useMemo } from "react";
import styled from "@emotion/styled";
import EventList from "../events/EventList";
import SearchOptions from "../search/SearchOptions";
import {
  FaSortAmountDown,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

// Emotion
// ページ全体のコンテナスタイル
// --- Emotion Styles ---

// ページ全体のレイアウト
const PageContainer = styled.div`
  background-color: #f9f9f9;
  min-height: 100vh;
`;

// 検索オプションセクション
const SearchSection = styled.section`
  margin-bottom: 24px;
  background-color: #97cdf3;
  padding: 40px 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

// イベントリストセクション
const EventSection = styled.section`
  padding: 0 24px 60px 24px;
  max-width: 1200px;
  margin: 0 auto 90px auto;

  @media (min-width: 768px) {
    margin: 0 auto;
  }
`;

// セクションタイトルスタイル
const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: "";
    display: block;
    width: 6px;
    height: 24px;
    background-color: #007bff;
    border-radius: 3px;
  }
`;

// コントロールバー（件数表示とソートボタン）
const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
  background-color: #fff;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid #eee;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
`;

// 結果件数表示
const ResultCount = styled.p`
  font-size: 0.95rem;
  color: #666;
  font-weight: 500;

  strong {
    color: #333;
    font-size: 1.1rem;
    margin: 0 4px;
  }
`;

// ソート選択エリア
const SortWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// ソートラベル
const SortLabel = styled.label`
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
`;

// ソートセレクトボックス
const SortSelect = styled.select`
  padding: 8px 12px;
  font-size: 0.9rem;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #fff;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #007bff;
  }
`;

// ページネーションエリア
const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
`;

// ページネーションボタン
const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: bold;
  color: #007bff;
  background-color: #fff;
  border: 1px solid #007bff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #007bff;
    color: #fff;
  }

  &:disabled {
    color: #ccc;
    border-color: #ccc;
    cursor: not-allowed;
    background-color: #f9f9f9;
  }
`;

// ページ情報表示
const PageInfo = styled.span`
  font-size: 1rem;
  color: #555;
  font-weight: 500;
`;

/**
 * ページ全体のレイアウトと状態を管理するコンポーネント
 * @param {{ events: object[] }} props - page.jsから渡される全イベントデータ
 */
export default function HomePage({ events }) {
  // 状態管理
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 1ページあたりの表示件数

  // データのソート処理 (useMemoで重い計算を防ぐ)
  const sortedEvents = useMemo(() => {
    // 元の配列を破壊しないようにコピーする
    let sorted = [...(events || [])];

    switch (sortOption) {
      case "newest":
        // 新しい順 (作成日時順)
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "date_asc":
        // 開催日が近い順 (昇順: 日付が小さい順)
        sorted.sort(
          (a, b) => new Date(a.start_datetime) - new Date(b.start_datetime)
        );
        break;
      case "date_desc":
        // 開催日が遠い順 (降順: 日付が大きい順)
        sorted.sort(
          (a, b) => new Date(b.start_datetime) - new Date(a.start_datetime)
        );
        break;
      case "popular":
        // 人気順 (現段階では新しい順と同じ)
        // 将来的にはお気に入り数とか閲覧数でソートしたい
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "nearest":
        // 現在地から近い順 (現段階では新しい順と同じ)
        // 将来的には Geolocation API で現在地を取って計算したい
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default:
        break;
    }
    return sorted;
  }, [events, sortOption]);

  // ページネーション処理
  const totalItems = sortedEvents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // 現在のページに表示するイベントだけを切り出す
  const currentEvents = sortedEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 件数表示用の開始・終了インデックス計算
  const startCount =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endCount = Math.min(currentPage * itemsPerPage, totalItems);

  // ハンドラ関数
  const handleSortChange = e => {
    setSortOption(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  // --- JSX ---
  return (
    <PageContainer>
      <SearchSection>
        <SearchOptions />
      </SearchSection>

      <EventSection>
        <SectionTitle>おすすめイベント</SectionTitle>

        {/* コントロールバー (件数 & ソート) */}
        <ControlBar>
          <ResultCount>
            <strong>{startCount}</strong> - <strong>{endCount}</strong> 件を表示
            <span
              style={{ fontSize: "0.85em", marginLeft: "4px", color: "#888" }}
            >
              (全 {totalItems} 件)
            </span>
          </ResultCount>

          <SortWrapper>
            <SortLabel>
              <FaSortAmountDown />
              並び替え:
            </SortLabel>
            <SortSelect value={sortOption} onChange={handleSortChange}>
              <option value="newest">新規のイベント</option>
              <option value="date_asc">開催日が近い順</option>
              <option value="date_desc">開催日が遠い順</option>
              <option value="popular">人気順 (仮)</option>
              <option value="nearest">現在地から近い順 (仮)</option>
            </SortSelect>
          </SortWrapper>
        </ControlBar>

        {/* イベント一覧 (切り出した10件だけを渡す) */}
        <EventList events={currentEvents} />

        {/* ページネーション (イベントがある時だけ表示) */}
        {totalItems > 0 && (
          <PaginationContainer>
            <PageButton onClick={handlePrevPage} disabled={currentPage === 1}>
              <FaChevronLeft /> 前のページ
            </PageButton>

            <PageInfo>
              Page <strong>{currentPage}</strong> / {totalPages}
            </PageInfo>

            <PageButton
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              次のページ <FaChevronRight />
            </PageButton>
          </PaginationContainer>
        )}
      </EventSection>
    </PageContainer>
  );
}