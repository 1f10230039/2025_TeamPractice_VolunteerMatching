"use client";

import { useState, useMemo, useEffect } from "react";
import styled from "@emotion/styled";
import { supabase } from "@/lib/supabaseClient";
import EventList from "../events/EventList";
import SearchOptions from "../search/SearchOptions";
import {
  FaSortAmountDown,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

// ==========================================
// Emotion Styles (スタイル定義)
// ==========================================

// ページ全体の背景とレイアウト
const PageContainer = styled.div`
  background-color: #f9f9f9;
  min-height: 100vh;
`;

// 上部の青い検索エリア
const SearchSection = styled.section`
  margin-bottom: 24px;
  background-color: #97cdf3;
  padding: 40px 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

// イベントリストを表示するメインエリア（幅制限あり）
const EventSection = styled.section`
  padding: 0 24px 60px 24px;
  max-width: 1200px;
  margin: 0 auto 90px auto;

  @media (min-width: 768px) {
    margin: 0 auto;
  }
`;

// セクションの見出し（「おすすめイベント」など）
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

// リスト上部のコントロールバー（件数表示とソートボタン）
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

// 結果件数のテキスト
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

// ソート選択エリアのラッパー
const SortWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// 「並び替え:」のラベル
const SortLabel = styled.label`
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
`;

// ソート順を選ぶセレクトボックス
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

// ページネーション（ページ送り）エリア
const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
`;

// ページ送りボタン（「前のページ」「次のページ」）
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

// 現在のページ番号表示
const PageInfo = styled.span`
  font-size: 1rem;
  color: #555;
  font-weight: 500;
`;

// ==========================================
// コンポーネント本体
// ==========================================

/**
 * トップページ (HomePage)
 * イベント一覧の表示、ソート、ページネーション、お気に入り情報の管理を行います。
 */
export default function HomePage({ events }) {
  // 状態管理
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 1ページあたりの表示件数

  // ユーザーのお気に入りIDリストを保持するState
  const [userFavoriteIds, setUserFavoriteIds] = useState([]);

  /**
   * 初回ロード時 + イベントデータ更新時に実行
   * ログインユーザーの「お気に入り済みイベントID一覧」を取得してStateに保存する。
   * これにより、一覧画面のハートを赤く表示できる。
   */
  useEffect(() => {
    const fetchFavorites = async () => {
      // 1. ログインユーザーを取得
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return; // 未ログインなら何もしない

      // 2. favoritesテーブルから、自分の event_id 一覧を取得
      const { data, error } = await supabase
        .from("favorites")
        .select("event_id")
        .eq("user_id", user.id);

      if (!error && data) {
        // IDを数値型に変換して保存 (型不一致を防ぐため)
        setUserFavoriteIds(data.map(item => Number(item.event_id)));
      }
    };

    fetchFavorites();
  }, [events]);

  /**
   * データのソート処理 (useMemoで重い計算を防ぐ)
   * 選択されたソート順(sortOption)に応じてイベント配列を並び替える
   */
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

  // ページネーション処理: 現在のページに表示すべきデータだけを切り出す
  const totalItems = sortedEvents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentEvents = sortedEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

        {/* イベント一覧を表示 */}
        <EventList
          events={currentEvents}
          userFavoriteIds={userFavoriteIds} // ★ お気に入りIDリストを渡す
        />

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
