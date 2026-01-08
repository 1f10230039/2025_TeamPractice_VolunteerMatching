// ボランティアイベント一覧コンポーネント
"use client";

import styled from "@emotion/styled";
import EventCard from "./EventsCard"; // ファイル名は環境に合わせてね！

// --- Emotion Styles ---
// イベントリスト全体のコンテナスタイル
const ListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-top: 16px;
  justify-content: center;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

// --- EventList Component ---
/**
 * イベントカードをリスト表示するコンポーネント
 * @param {object[]} events - 表示するイベントの配列
 * @param {number[]} userFavoriteIds - ログインユーザーがお気に入り済みのイベントID配列
 */
export default function EventList({
  events,
  source,
  query,
  codes,
  userFavoriteIds = [],
}) {
  // もしイベントが空ならメッセージ表示
  if (!events || events.length === 0) {
    // 表示できるイベントがない場合のメッセージ
    return (
      <p style={{ textAlign: "center", color: "#666", padding: "40px" }}>
        表示できるイベントがありません。
      </p>
    );
  }

  // イベントカードのリストをレンダリング
  return (
    <ListContainer>
      {events.map(event => {
        // お気に入り状態の判定
        const isFav = userFavoriteIds.some(
          favId => String(favId) === String(event.id)
        );

        return (
          <EventCard
            key={event.id}
            event={event}
            source={source}
            query={query}
            codes={codes}
            isFavorite={isFav}
          />
        );
      })}
    </ListContainer>
  );
}
