// キーワード検索入力コンポーネント
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "@emotion/styled";

// 検索フォーム全体
const SearchForm = styled.form`
  display: flex;
  gap: 8px;
  width: 100%;
`;

// キーワード入力欄
const SearchInput = styled.input`
  flex-grow: 1;
  padding: 12px 16px;
  font-size: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

// 検索ボタン
const SearchButton = styled.button`
  padding: 12px 16px;
  font-size: 1rem;
  font-weight: bold;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

export default function KeywordSearchInput() {
  const router = useRouter();
  // 1. 入力されたキーワードを覚えておくための State
  const [query, setQuery] = useState("");

  // 2. フォームが送信（ボタンクリック）された時の処理
  const handleSearch = e => {
    e.preventDefault(); // ページがリロードされちゃうのを防ぐ
    if (!query.trim()) {
      // もし入力が空っぽだったら何もしない
      return;
    }

    // 3. 検索結果ページに、クエリパラメータを付けて飛ばす
    router.push(`/search/results?q=${encodeURIComponent(query)}`);
  };

  return (
    <SearchForm onSubmit={handleSearch}>
      <SearchInput
        type="search"
        placeholder="キーワードを入力..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <SearchButton type="submit">検索</SearchButton>
    </SearchForm>
  );
}
