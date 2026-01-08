// ホームページコンポーネント
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import EventList from "../events/EventList";
import SearchOptions from "../search/SearchOptions";
import SearchOptionMini from "../search/SearchOptionsMini";
import {
  FaSortAmountDown,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
  FaArrowUp,
} from "react-icons/fa";

// --- Emotion Styles ---
const PageContainer = styled.div`
  background-color: #f5fafc;
  min-height: 100vh;
  padding-bottom: 60px;
  @media (max-width: 600px) {
    margin-bottom: 60px;
  }
`;

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

const slideDown = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const FixedHeader = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: linear-gradient(135deg, #68b5d5 0%, #4a90e2 100%);
  border-radius: 0 0 20px 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 12px 24px;
  animation: ${slideDown} 0.3s ease-out forwards;
  display: flex;
  justify-content: center;
`;

const EventSection = styled.section`
  padding: 0 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: 1.6rem;
  font-weight: 800;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #333;
  letter-spacing: 0.05em;

  &::before {
    content: "";
    display: block;
    width: 6px;
    height: 32px;
    background: linear-gradient(to bottom, #68b5d5, #4a90e2);
    border-radius: 3px;
  }

  @media (max-width: 600px) {
    font-size: 1.2rem;
    margin-bottom: 16px;
  }
`;

const IconWrapper = styled.span`
  color: #4a90e2;
  display: flex;
  align-items: center;
  font-size: 1.8rem;
  filter: drop-shadow(0 2px 4px rgba(74, 144, 226, 0.3));
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

  @media (max-width: 600px) {
    cursor: pointer;
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

// タグリストのラッパー
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

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
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

/**
 * ページ全体のレイアウトと状態を管理するコンポーネント
 */
export default function HomePage({ events }) {
  // State
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showMiniSearch, setShowMiniSearch] = useState(false);
  const searchSectionRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTagIds, sortOption]);

  useEffect(() => {
    const handleScroll = () => {
      if (searchSectionRef.current) {
        const searchBottom =
          searchSectionRef.current.getBoundingClientRect().bottom;
        if (searchBottom < 0) {
          setShowMiniSearch(true);
        } else {
          setShowMiniSearch(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- ページ切り替え時にトップへスクロールする処理 ---
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentPage]);

  // --- 利用可能なタグ一覧の抽出 ---
  const availableTags = useMemo(() => {
    const tagsMap = new Map();
    (events || []).forEach(event => {
      if (event.tags && Array.isArray(event.tags)) {
        event.tags.forEach(tag => {
          if (!tagsMap.has(tag.id)) {
            tagsMap.set(tag.id, tag);
          }
        });
      }
    });
    return Array.from(tagsMap.values()).sort((a, b) => a.id - b.id);
  }, [events]);

  // --- フィルタリング & ソート ---
  const processedEvents = useMemo(() => {
    let temp = [...(events || [])];

    if (selectedTagIds.length > 0) {
      temp = temp.filter(event => {
        if (!event.tags) return false;
        const eventTagIds = event.tags.map(t => t.id);
        return selectedTagIds.every(selId => eventTagIds.includes(selId));
      });
    }

    switch (sortOption) {
      case "newest":
        temp.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "date_asc":
        temp.sort(
          (a, b) => new Date(a.start_datetime) - new Date(b.start_datetime)
        );
        break;
      case "date_desc":
        temp.sort(
          (a, b) => new Date(b.start_datetime) - new Date(a.start_datetime)
        );
        break;
      case "popular":
        temp.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "nearest":
        temp.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default:
        break;
    }
    return temp;
  }, [events, sortOption, selectedTagIds]);

  // ---ページネーション用計算 ---
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
    <PageContainer>
      {showMiniSearch && (
        <FixedHeader>
          <div style={{ width: "100%", maxWidth: "800px" }}>
            <SearchOptionMini />
          </div>
        </FixedHeader>
      )}
      <SearchSection ref={searchSectionRef}>
        <SearchOptions />
      </SearchSection>

      <EventSection>
        <SectionTitle>
          <IconWrapper>
            <FaStar />
          </IconWrapper>
          おすすめのボランティア
        </SectionTitle>

        {availableTags.length > 0 && (
          <FilterSection>
            <FilterHeader onClick={toggleFilter}>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
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
