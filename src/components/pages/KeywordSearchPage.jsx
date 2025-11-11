// キーワード検索ページコンポーネント
"use client";

import styled from "@emotion/styled";
import KeywordSearchInput from "../search/KeywordSearchInput";
import SearchHistoryList from "../search/SearchHistoryList";
import Breadcrumbs from "../common/Breadcrumbs";

// ページ全体のコンテナ
const PageContainer = styled.div`
  padding: 24px;
`;

// "以前検索した履歴" のタイトル
const HistoryTitle = styled.h2`
  font-size: 1.2rem;
  color: #555;
  margin-top: 32px;
  margin-bottom: 16px;
`;

// サーバーから渡された初期データを受け取る
export default function KeywordSearchPage({ initialHistory }) {
  // サーバーから受け取ったデータをクライアントの状態として持つ
  const history = initialHistory;

  // パンくずリスト用データ
  const crumbs = [{ label: "キーワード検索", href: "/keyword-search" }];

  return (
    <>
      <Breadcrumbs crumbs={crumbs} />
      <PageContainer>
        <KeywordSearchInput />
        <HistoryTitle>以前検索した履歴</HistoryTitle>
        <SearchHistoryList history={history} />
      </PageContainer>
    </>
  );
}
