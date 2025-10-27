// 検索結果ページ
"use client";

import styled from "@emotion/styled";
import KeywordSearchInput from "../search/KeywordSearchInput";
import EventList from "../events/EventList";

// ページ全体のコンテナ
const PageContainer = styled.div`
  padding: 24px 0;
`;

// 検索窓を画面上部に固定するためのラッパー
const SearchInputContainer = styled.div`
  position: sticky;
  top: 0;

  @media (min-width: 768px) {
    top: 73px;
  }

  background-color: #ffffff;
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  z-index: 10;
`;

// 「〇〇」の検索結果というタイトルのスタイル
const ResultTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 20px;
  padding: 0 24px;
`;

// イベント一覧（結果）を囲むラッパー
const ListWrapper = styled.div`
  padding: 0 24px;
`;

// サーバーから渡されたデータを受け取る
export default function SearchResultsPage({ query, initialEvents }) {
  // サーバーから受け取ったデータをクライアントで使う
  const events = initialEvents || [];

  return (
    <PageContainer>
      <SearchInputContainer>
        <KeywordSearchInput />
      </SearchInputContainer>

      {query && (
        <ResultTitle>
          {events.length > 0
            ? `「${query}」の検索結果 (${events.length}件)`
            : `「${query}」に一致するイベントは見つかりませんでした。`}
        </ResultTitle>
      )}

      {events.length > 0 && (
        <ListWrapper>
          <EventList events={events} />
        </ListWrapper>
      )}
    </PageContainer>
  );
}
