"use client";

import styled from "@emotion/styled";
import EventCard from "./EventsCard";

// Emotion
// イベントカードをグリッド状に並べるコンテナスタイル
const ListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
  margin-top: 16px;
`;

/**
 * イベントカードをリスト表示するコンポーネント
 * @param {{
 * events: object[],
 * userFavoriteIds: number[] // ログインユーザーがお気に入りしたイベントIDの配列
 * }} props
 */
export default function EventList({
  events,
  source,
  query,
  codes,
  userFavoriteIds = [], // デフォルトは空配列
}) {
  // もしイベントが1件もなかったら
  if (!events || events.length === 0) {
    return <p>表示できるイベントがありません。</p>;
  }

  // イベントがある場合は、mapでEventCardを並べる
  return (
    <ListContainer>
      {events.map(event => {
        // このイベントが、ユーザーのお気に入りリストに含まれているか判定
        const isFav = userFavoriteIds.includes(event.id);

        return (
          <EventCard
            key={event.id}
            event={event}
            source={source}
            query={query}
            codes={codes}
            isFavorite={isFav} // 判定結果をEventCardに渡す
          />
        );
      })}
    </ListContainer>
  );
}
