//共通検索結果コンポーネント
"use client";

import { useState, useMemo, useEffect } from "react";
import styled from "@emotion/styled";
import EventList from "../events/EventList";
import SearchOptionsMini from "../search/SearchOptionsMini";
import Breadcrumbs from "../common/Breadcrumbs";
import EmptyState from "../common/EmptyState";
import {
  FaSearch,
  FaSortAmountDown,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
  FaArrowUp,
} from "react-icons/fa";

// --- Emotion Styles ---
const StickyHeaderWrapper = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
`;

const BreadcrumbsArea = styled.div`
  background-color: #f5fafc;
  padding: 0;
`;

const SearchInputContainer = styled.div`
  background: linear-gradient(135deg, #68b5d5 0%, #4a90e2 100%);
  padding: 16px 24px;
  border-radius: 0 0 20px 20px;
`;

const PageResultsContainer = styled.div`
  padding: 24px;
  margin-bottom: 140px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
`;

const ResultTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 24px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: "";
    display: block;
    width: 6px;
    height: 24px;
    background-color: #4a90e2;
    border-radius: 3px;
  }
`;

const FilterSection = styled.div`
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;

  @media (max-width: 600px) {
    padding: 16px;
  }
`;

const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 0.95rem;
  font-weight: bold;
  color: #555;

  @media (max-width: 600px) {
    cursor: pointer;
    margin-bottom: 0;
  }
`;

// スマホ用の開閉アイコン
const MobileToggleIcon = styled.span`
  display: none;
  @media (max-width: 600px) {
    display: flex;
    align-items: center;
    color: #888;
    margin-left: 8px;
  }
`;

// タグリストのラッパー（開閉制御用）
const TagListWrapper = styled.div`
  display: block;

  @media (max-width: 600px) {
    display: ${props => (props.isOpen ? "block" : "none")};
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px dashed #eee;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FilterTagButton = styled.button`
  padding: 8px 16px;
  border-radius: 30px;
  border: 1px solid ${props => (props.isSelected ? "#007bff" : "#eee")};
  background-color: ${props => (props.isSelected ? "#eaf4ff" : "#f9f9f9")};
  color: ${props => (props.isSelected ? "#007bff" : "#555")};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background-color: ${props => (props.isSelected ? "#dbeeff" : "#f0f0f0")};
  }
`;

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
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
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
`;

const SortSelect = styled.select`
  padding: 8px 16px;
  font-size: 0.9rem;
  color: #333;
  border: 1px solid #e0e0e0;
  border-radius: 30px;
  background-color: #fff;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: #4a90e2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 50px;
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 0.95rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;

  background: linear-gradient(135deg, #68b5d5 0%, #4a90e2 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 10px rgba(74, 144, 226, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(74, 144, 226, 0.4);
  }

  &:disabled {
    background: #e0e0e0;
    color: #999;
    box-shadow: none;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  font-size: 1rem;
  color: #555;
  font-weight: 600;
  strong {
    color: #333;
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
    bottom: 105px;
    right: 20px;
  }
`;

const ListWrapper = styled.div`
  /* 検索結果リストのラッパー */
`;

/**
 * 検索結果を表示するための "共通" クライアントコンポーネント
 */
export default function CommonSearchResultsPage({
  titleText,
  events,
  crumbs,
  baseCrumb,
  source,
  query,
  codes,
}) {
  const safeEvents = events || [];

  // --- State Management ---
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTagIds, sortOption]);

  // --- 利用可能なタグ一覧の抽出 ---
  const availableTags = useMemo(() => {
    const tagsMap = new Map();
    safeEvents.forEach(event => {
      if (event.tags && Array.isArray(event.tags)) {
        event.tags.forEach(tag => {
          if (!tagsMap.has(tag.id)) {
            tagsMap.set(tag.id, tag);
          }
        });
      }
    });
    return Array.from(tagsMap.values()).sort((a, b) => a.id - b.id);
  }, [safeEvents]);

  // --- ページ切り替え時にトップへスクロールする処理 ---
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentPage]);

  // --- フィルタリング & ソート ---
  const processedEvents = useMemo(() => {
    let tempEvents = [...safeEvents];
    if (selectedTagIds.length > 0) {
      tempEvents = tempEvents.filter(event => {
        if (!event.tags) return false;
        const eventTagIds = event.tags.map(t => t.id);
        return selectedTagIds.every(selId => eventTagIds.includes(selId));
      });
    }

    switch (sortOption) {
      case "newest":
        tempEvents.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        break;
      case "date_asc":
        tempEvents.sort(
          (a, b) => new Date(a.start_datetime) - new Date(b.start_datetime)
        );
        break;
      case "date_desc":
        tempEvents.sort(
          (a, b) => new Date(b.start_datetime) - new Date(a.start_datetime)
        );
        break;
      default:
        break;
    }

    return tempEvents;
  }, [safeEvents, selectedTagIds, sortOption]);

  // --- ページネーション用計算 ---
  const totalItems = processedEvents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentEvents = processedEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startCount =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endCount = Math.min(currentPage * itemsPerPage, totalItems);

  // --- Handlers ---
  const handleTagClick = tagId => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSortChange = e => {
    setSortOption(e.target.value);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  // スマホ用フィルター開閉トグル
  const toggleFilter = () => {
    setIsFilterOpen(prev => !prev);
  };

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

  return (
    <section>
      {/* 固定ヘッダー */}
      <StickyHeaderWrapper>
        <BreadcrumbsArea>
          <Breadcrumbs crumbs={crumbs} baseCrumb={baseCrumb} />
        </BreadcrumbsArea>
        <SearchInputContainer>
          <SearchOptionsMini />
        </SearchInputContainer>
      </StickyHeaderWrapper>

      <PageResultsContainer>
        <ResultTitle>{titleText}</ResultTitle>

        {/* タグフィルターエリア */}
        {availableTags.length > 0 && (
          <FilterSection>
            <FilterHeader onClick={toggleFilter}>
              <span
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <FaFilter color="#888" /> タグで絞り込む
              </span>

              <div style={{ display: "flex", alignItems: "center" }}>
                {selectedTagIds.length > 0 && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedTagIds([]);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#888",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      textDecoration: "underline",
                      marginRight: "10px",
                    }}
                  >
                    全てのタグを解除
                  </button>
                )}

                <MobileToggleIcon>
                  {isFilterOpen ? <FaChevronUp /> : <FaChevronDown />}
                </MobileToggleIcon>
              </div>
            </FilterHeader>

            <TagListWrapper isOpen={isFilterOpen}>
              <TagList>
                {availableTags.map(tag => (
                  <FilterTagButton
                    key={tag.id}
                    isSelected={selectedTagIds.includes(tag.id)}
                    onClick={() => handleTagClick(tag.id)}
                  >
                    {tag.name}
                  </FilterTagButton>
                ))}
              </TagList>
            </TagListWrapper>
          </FilterSection>
        )}

        {/* コントロールバー */}
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

        {/* イベントリスト */}
        {totalItems > 0 ? (
          <ListWrapper>
            <EventList
              events={currentEvents}
              source={source}
              query={query}
              codes={codes}
            />
          </ListWrapper>
        ) : (
          <ListWrapper>
            <EmptyState
              title="条件に一致するイベントが見つかりません"
              description="キーワードを変えたり、タグの絞り込みを解除して、もう一度探してみてください。"
              icon={<FaSearch />}
              actionLabel="トップページに戻る"
              actionHref="/"
            />
          </ListWrapper>
        )}

        {/* ページネーション */}
        {totalItems > 0 && (
          <PaginationContainer>
            <PageButton onClick={handlePrevPage} disabled={currentPage === 1}>
              <FaChevronLeft /> 前へ
            </PageButton>
            <PageInfo>
              <strong>{currentPage}</strong> / {totalPages} ページ
            </PageInfo>
            <PageButton
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              次へ <FaChevronRight />
            </PageButton>
          </PaginationContainer>
        )}

        <ScrollTopButton
          show={showScrollTop}
          onClick={scrollToTop}
          aria-label="トップへ戻る"
        >
          <FaArrowUp />
        </ScrollTopButton>
      </PageResultsContainer>
    </section>
  );
}
