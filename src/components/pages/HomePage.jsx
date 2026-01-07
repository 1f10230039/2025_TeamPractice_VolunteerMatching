"use client";

import { useState, useMemo } from "react";
import styled from "@emotion/styled";
import EventList from "../events/EventList";
import SearchOptions from "../search/SearchOptions";
import {
  FaSortAmountDown,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
} from "react-icons/fa";

// --- Emotion Styles ---

// ページ全体のレイアウト
const PageContainer = styled.div`
  background-color: #f5fafc;
  min-height: 100vh;
  padding-bottom: 60px;
  @media (max-width: 600px) {
    margin-bottom: 20px;
  }
`;

// 検索エリア
const SearchSection = styled.section`
  margin-bottom: 24px;
  background: linear-gradient(135deg, #68b5d5 0%, #4a90e2 100%);
  padding: 40px 24px;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.2);
  border-radius: 0 0 30px 30px;

  @media (max-width: 600px) {
    padding: 30px 16px;
    border-radius: 0 0 20px 20px;
  }
`;

const EventSection = styled.section`
  padding: 0 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

// 見出しのデザイン
const SectionTitle = styled.h2`
  font-size: 1.6rem;
  font-weight: 800;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #333;
  letter-spacing: 0.05em;
`;

// アイコン
const IconWrapper = styled.span`
  color: #4a90e2;
  display: flex;
  align-items: center;
  font-size: 1.8rem;
  filter: drop-shadow(0 2px 4px rgba(74, 144, 226, 0.3));
`;

// コントロールバー
const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
  background-color: #fff;
  padding: 16px 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(122, 211, 232, 0.15);
`;

const ResultCount = styled.p`
  font-size: 0.95rem;
  color: #666;
  font-weight: 500;

  strong {
    color: #333;
    font-size: 1.2rem;
    margin: 0 4px;
  }
`;

// ソート選択エリア
const SortWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SortLabel = styled.label`
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;

  & svg {
    color: #666;
  }
`;

const SortSelect = styled.select`
  padding: 10px 16px;
  font-size: 0.95rem;
  color: #333;
  border: 1px solid #e0e0e0;
  border-radius: 30px;
  background-color: #f9f9f9;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    background-color: #fff;
    border-color: #4a90e2;
  }

  &:focus {
    border-color: #4a90e2;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }
`;

// ページネーションエリア
const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 60px;
  margin-bottom: 40px;
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);

  background: linear-gradient(135deg, #68b5d5 0%, #4a90e2 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 10px rgba(74, 144, 226, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(74, 144, 226, 0.4);
    filter: brightness(1.05);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    filter: brightness(0.95);
  }

  &:disabled {
    background: #e0e0e0;
    color: #999;
    box-shadow: none;
    cursor: not-allowed;
  }
  @media (max-width: 600px) {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
`;

const PageInfo = styled.span`
  font-size: 1.1rem;
  color: #555;
  font-weight: 600;

  strong {
    color: #333;
  }
`;

/**
 * ページ全体のレイアウトと状態を管理するコンポーネント
 */
export default function HomePage({ events }) {
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedEvents = useMemo(() => {
    let sorted = [...(events || [])];
    switch (sortOption) {
      case "newest":
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "date_asc":
        sorted.sort(
          (a, b) => new Date(a.start_datetime) - new Date(b.start_datetime)
        );
        break;
      case "date_desc":
        sorted.sort(
          (a, b) => new Date(b.start_datetime) - new Date(a.start_datetime)
        );
        break;
      case "popular":
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "nearest":
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default:
        break;
    }
    return sorted;
  }, [events, sortOption]);

  const totalItems = sortedEvents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentEvents = sortedEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startCount =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endCount = Math.min(currentPage * itemsPerPage, totalItems);

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

  return (
    <PageContainer>
      <SearchSection>
        <SearchOptions />
      </SearchSection>

      <EventSection>
        <SectionTitle>
          <IconWrapper>
            <FaStar />
          </IconWrapper>
          おすすめのボランティア
        </SectionTitle>

        <ControlBar>
          <ResultCount>
            <strong>{startCount}</strong> - <strong>{endCount}</strong> 件を表示
            <span
              style={{ fontSize: "0.9em", marginLeft: "6px", color: "#888" }}
            >
              (全 {totalItems} 件)
            </span>
          </ResultCount>

          <SortWrapper>
            <SortLabel>
              <FaSortAmountDown />
              並び替え
            </SortLabel>
            <SortSelect value={sortOption} onChange={handleSortChange}>
              <option value="newest">新しい順</option>
              <option value="date_asc">開催日が近い順</option>
              <option value="date_desc">開催日が遠い順</option>
            </SortSelect>
          </SortWrapper>
        </ControlBar>

        <EventList events={currentEvents} />

        {totalItems > 0 && (
          <PaginationContainer>
            <PageButton onClick={handlePrevPage} disabled={currentPage === 1}>
              <FaChevronLeft /> 前へ
            </PageButton>

            <PageInfo>
              <strong>{currentPage}</strong> / {totalPages}
              ページ
            </PageInfo>

            <PageButton
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              次へ <FaChevronRight />
            </PageButton>
          </PaginationContainer>
        )}
      </EventSection>
    </PageContainer>
  );
}
