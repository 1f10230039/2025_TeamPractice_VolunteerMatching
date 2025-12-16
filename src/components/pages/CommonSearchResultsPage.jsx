// キーワード検索結果ページと市町村コード検索結果ページの両方で使う共通コンポーネント
"use client";

import { useState, useMemo } from "react";
import styled from "@emotion/styled";
import EventList from "../events/EventList";
import SearchOptionsMini from "../search/SearchOptionsMini";
import Breadcrumbs from "../common/Breadcrumbs";

import EmptyState from "../common/EmptyState";
import { FaSearch } from "react-icons/fa";

// Emotion

// 検索窓を画面上部に固定するためのラッパー
const SearchInputContainer = styled.div`
  background: linear-gradient(135deg, #68b5d5 0%, #4a90e2 100%);
  position: sticky;
  top: 0;
  z-index: 10;

  @media (min-width: 768px) {
    top: 65px;
  }
`;

// 検索結果のコンテナ
const PageResultsContainer = styled.div`
  padding: 24px;
  margin-bottom: 150px;
`;

// 検索結果というタイトルのスタイル
const ResultTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0 auto 16px auto;
  padding: 0 24px;
  @media (max-width: 600px) {
    font-size: 1rem;
  }
`;

// イベント一覧（結果）を囲むラッパー
const ListWrapper = styled.div`
  padding: 0 24px;
  @media (max-width: 600px) {
    margin: 0 auto;
  }
`;

// フィルターコンテナ
const FilterContainer = styled.div`
  padding: 0 24px 24px 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

// フィルタタグボタン
const FilterTagButton = styled.button`
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid ${props => (props.isSelected ? "#007bff" : "#ddd")};
  background-color: ${props => (props.isSelected ? "#007bff" : "#fff")};
  color: ${props => (props.isSelected ? "#fff" : "#555")};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => (props.isSelected ? "#0056b3" : "#f0f0f0")};
  }
  @media (max-width: 600px) {
    font-size: 0.8rem;
  }
`;

/**
 * 検索結果を表示するための "共通" クライアントコンポーネント
 * @param {{
 * titleText: string,  // サーバー側で作られた「タイトル文字列」
 * events: Array      // サーバー側で取得された「イベントの配列」
 * crumbs: Array,  // パンくずリスト用データ
 * baseCrumb: object // ベースのパンくずリスト用データ
 * source: string, // 検索元のページを示す文字列
 * query: string,  // キーワード検索クエリ
 * codes: string   // 市町村コードの文字列
 * }} props
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

  // タグフィルター用の状態管理
  const [selectedTagIds, setSelectedTagIds] = useState([]);

  // 利用可能なタグ一覧をイベントデータから抽出して一意にする
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
    // ID順に並べて返す
    return Array.from(tagsMap.values()).sort((a, b) => a.id - b.id);
  }, [safeEvents]);

  // タグフィルターのクリック処理
  const handleTagClick = tagId => {
    setSelectedTagIds(prev => {
      if (prev.includes(tagId)) {
        // すでに選択されてたら外す
        return prev.filter(id => id !== tagId);
      } else {
        // 選択されてなかったら追加する
        return [...prev, tagId];
      }
    });
  };

  // 選択されたタグに基づいてイベントをフィルタリングする
  const filteredEvents = useMemo(() => {
    // タグが何も選択されてなければ、そのまま全部表示
    if (selectedTagIds.length === 0) {
      return safeEvents;
    }

    // 選択されたタグをすべて持っているイベントだけを残す (AND検索)
    return safeEvents.filter(event => {
      if (!event.tags) return false;
      const eventTagIds = event.tags.map(t => t.id);
      // selectedTagIds のすべての ID が、eventTagIds に含まれているかチェック
      return selectedTagIds.every(selId => eventTagIds.includes(selId));
    });
  }, [safeEvents, selectedTagIds]);

  return (
    <section>
      <SearchInputContainer>
        <SearchOptionsMini />
      </SearchInputContainer>

      <Breadcrumbs crumbs={crumbs} baseCrumb={baseCrumb} />

      <PageResultsContainer>
        <ResultTitle>{titleText}</ResultTitle>
        {availableTags.length > 0 && (
          <FilterContainer>
            <span
              style={{
                fontSize: "0.9rem",
                color: "#555",
                alignSelf: "center",
                marginRight: "8px",
              }}
            >
              絞り込み:
            </span>
            {availableTags.map(tag => (
              <FilterTagButton
                key={tag.id}
                isSelected={selectedTagIds.includes(tag.id)}
                onClick={() => handleTagClick(tag.id)}
              >
                {tag.name}
              </FilterTagButton>
            ))}
            {selectedTagIds.length > 0 && (
              <button
                onClick={() => setSelectedTagIds([])}
                style={{
                  background: "none",
                  border: "none",
                  color: "#888",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  textDecoration: "underline",
                  marginLeft: "8px",
                }}
              >
                クリア
              </button>
            )}
          </FilterContainer>
        )}
        {filteredEvents.length > 0 ? (
          <ListWrapper>
            <EventList
              events={filteredEvents}
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
              // ボタンはナシでもOK
              actionLabel="トップページに戻る"
              actionHref="/"
            />
          </ListWrapper>
        )}
      </PageResultsContainer>
    </section>
  );
}
