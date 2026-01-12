// キーワード検索ページコンポーネント
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import styled from "@emotion/styled";
import KeywordSearchInput from "../search/KeywordSearchInput";
import SearchHistoryList from "../search/SearchHistoryList";
import Breadcrumbs from "../common/Breadcrumbs";

// ページ全体のコンテナ
const PageContainer = styled.div`
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
  @media (max-width: 600px) {
    margin-bottom: 120px;
  }
`;

const HistoryTitle = styled.h2`
  font-size: 1.2rem;
  color: #555;
  margin-top: 32px;
  margin-bottom: 16px;
`;

export default function KeywordSearchPage() {
  // データを持たせる（初期値は空）
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // 画面が表示されたらデータを取りに行く
  useEffect(() => {
    const fetchHistory = async () => {
      // ログインユーザー確認
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return; // ログインしてなければ何もしない
      }

      // 履歴を取得
      const { data, error } = await supabase
        .from("search_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("履歴取得エラー:", error);
      } else {
        setHistory(data || []);
      }
      setLoading(false);
    };

    fetchHistory();
  }, []); // 最初の1回だけ実行

  const crumbs = [{ label: "キーワード検索", href: "/keyword-search" }];

  return (
    <>
      <Breadcrumbs crumbs={crumbs} />
      <PageContainer>
        <KeywordSearchInput />
        <HistoryTitle>以前検索した履歴</HistoryTitle>

        {loading ? (
          <p style={{ color: "#888", textAlign: "center" }}>読み込み中...</p>
        ) : (
          <SearchHistoryList history={history} />
        )}
      </PageContainer>
    </>
  );
}
