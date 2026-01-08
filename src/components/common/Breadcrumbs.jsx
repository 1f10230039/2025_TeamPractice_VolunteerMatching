// パンくずリストコンポーネント
"use client";

import styled from "@emotion/styled";
import { FaHome } from "react-icons/fa";

// --- インラインSVGアイコン ---
const ChevronLeftIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 320 512"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"></path>
  </svg>
);

// --- Emotion Styles ---
// 全体のコンテナ
const NavContainer = styled.nav`
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  padding: 0 16px;
  height: 56px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 40;
`;

// コンテンツを中央に寄せるラッパー
const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
`;

// 「戻る」ボタン (アイコンのみ)
const BackButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #555;
  background-color: #f5f5f5;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 1.2rem;
  flex-shrink: 0;

  &:hover {
    background-color: #e0eafc;
    color: #007bff;
    transform: translateX(-2px);
  }
`;

// リスト表示エリア
const BreadcrumbList = styled.ol`
  display: flex;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  overflow: hidden; /* 長い場合は隠す */
  white-space: nowrap;
`;

// 各リストアイテム
const ListItem = styled.li`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #666;

  &:not(:first-of-type)::before {
    content: "/";
    margin: 0 8px;
    color: #ccc;
    font-size: 0.8rem;
  }

  @media (max-width: 600px) {
    &:not(:last-child) {
      display: none;
    }
    &:last-child::before {
      display: none;
    }
  }
`;

// リンクテキスト
const StyledLink = styled.a`
  text-decoration: none;
  color: #666;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    color: #007bff;
    text-decoration: underline;
  }

  svg {
    font-size: 1rem;
    margin-bottom: 2px;
  }
`;

// 現在のページ
const CurrentPage = styled.span`
  font-weight: 700;
  color: #333;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 600px) {
    font-size: 1rem;
    max-width: 240px;
  }
`;

// --- Breadcrumbs Component ---
export default function Breadcrumbs({ crumbs, baseCrumb }) {
  // baseCrumbが渡されなければデフォルトでホームに設定
  const base = baseCrumb || { label: "ホーム", href: "/" };

  // crumbsがない場合は表示しない
  if (!crumbs || crumbs.length === 0) return null;

  // 戻るリンクは2つ前のクラム、なければベースクラム
  const backLink = crumbs.length > 1 ? crumbs[crumbs.length - 2] : base;

  // レンダリング
  return (
    <NavContainer aria-label="breadcrumb">
      <ContentWrapper>
        <BackButton href={backLink.href} aria-label="前のページへ戻る">
          <ChevronLeftIcon />
        </BackButton>

        <BreadcrumbList>
          <ListItem>
            <StyledLink href={base.href}>
              {base.href === "/" && <FaHome />}
              {base.label}
            </StyledLink>
          </ListItem>

          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <ListItem key={index}>
                {isLast ? (
                  <CurrentPage aria-current="page">{crumb.label}</CurrentPage>
                ) : (
                  <StyledLink href={crumb.href}>{crumb.label}</StyledLink>
                )}
              </ListItem>
            );
          })}
        </BreadcrumbList>
      </ContentWrapper>
    </NavContainer>
  );
}
