// キーワード検索入力コンポーネント
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "@emotion/styled";
import { FiSearch } from "react-icons/fi";

// --- Emotion ---
// 検索フォーム全体
const SearchForm = styled.form`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

// キーワード入力欄
const SearchInput = styled.input`
  flex-grow: 1;
  padding: 14px 24px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 50px;
  background-color: #f9f9f9;
  color: #333;
  transition: all 0.2s ease;

  &::placeholder {
    color: #aaa;
  }

  &:focus {
    outline: none;
    border-color: #4a90e2;
    background-color: #fff;
    box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.1);
  }

  @media (max-width: 600px) {
    padding: 12px 20px;
    font-size: 14px;
  }
`;

// 検索ボタン
const SearchButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: bold;

  background: linear-gradient(135deg, #68b5d5 0%, #4a90e2 100%);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(74, 144, 226, 0.3);
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(74, 144, 226, 0.4);
    filter: brightness(1.05);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(74, 144, 226, 0.2);
  }

  @media (max-width: 600px) {
    padding: 12px 20px;
    font-size: 14px;
  }
`;

export default function KeywordSearchInput() {
  const router = useRouter();
  // 1. 入力されたキーワードを覚えておくための State
  const [query, setQuery] = useState("");

  // 2. フォームが送信（ボタンクリック）された時の処理
  const handleSearch = e => {
    e.preventDefault();
    if (!query.trim()) {
      // もし入力が空っぽだったら何もしない
      return;
    }

    // 3. 検索結果ページに、クエリパラメータを付けて飛ばす
    router.push(`/search/keyword-results?q=${encodeURIComponent(query)}`);
  };

  return (
    <SearchForm onSubmit={handleSearch}>
      <SearchInput
        type="search"
        placeholder="キーワードを入力..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <SearchButton type="submit">
        <FiSearch size={20} />
        <span>検索</span>
      </SearchButton>
    </SearchForm>
  );
}
