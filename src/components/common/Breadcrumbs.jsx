// パンくずリストコンポーネント
"use client";

import styled from "@emotion/styled";
import Link from "next/link";

// Emotionを使ったスタイリング
// ナビゲーション領域
const Nav = styled.nav`
  padding: 0.75rem 2rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  font-size: 0.9rem;
  @media (min-width: 768px) {
    padding: 1rem 4rem;
  }
`;

// 各パンくずリストの要素
const Crumb = styled.span`
  color: #6c757d;
  &::before {
    content: ">";
    margin: 0 0.5rem;
  }
`;

// リンクスタイル
const CrumbLink = styled(Link)`
  color: #007bff;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

// パンくずリストコンポーネント本体
export default function Breadcrumbs({ crumbs, baseCrumb }) {
  const base = baseCrumb || { label: "ホーム", href: "/" };
  // crumbs は { label: '表示名', href: 'リンク先' } の配列を想定
  return (
    <Nav aria-label="breadcrumb">
      <CrumbLink href={base.href}>{base.label}</CrumbLink>
      {/* crumbs が配列じゃなかったら何もしない（エラー防止） */}
      {Array.isArray(crumbs) &&
        crumbs.map((crumb, index) => {
          // 配列の最後の要素（現在のページ）はリンクにしない
          const isLast = index === crumbs.length - 1;
          return isLast ? (
            <Crumb key={index}>{crumb.label}</Crumb>
          ) : (
            <Crumb key={index}>
              <CrumbLink href={crumb.href}>{crumb.label}</CrumbLink>
            </Crumb>
          );
        })}
    </Nav>
  );
}
