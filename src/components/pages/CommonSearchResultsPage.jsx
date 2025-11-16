// キーワード検索結果ページと市町村コード検索結果ページの両方で使う共通コンポーネント
"use client";

import styled from "@emotion/styled";
import EventList from "../events/EventList";
import SearchOptionsMini from "../search/SearchOptionsMini";
import Breadcrumbs from "../common/Breadcrumbs";

// Emotion

// 検索窓を画面上部に固定するためのラッパー
const SearchInputContainer = styled.div`
  background-color: #97cdf3;
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
`;

// 検索結果というタイトルのスタイル
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

  return (
    <section>
      <SearchInputContainer>
        <SearchOptionsMini />
      </SearchInputContainer>

      <Breadcrumbs crumbs={crumbs} baseCrumb={baseCrumb} />

      <PageResultsContainer>
        <ResultTitle>{titleText}</ResultTitle>

        {safeEvents.length > 0 && (
          <ListWrapper>
            <EventList
              events={safeEvents}
              source={source}
              query={query}
              codes={codes}
            />
          </ListWrapper>
        )}
      </PageResultsContainer>
    </section>
  );
}
