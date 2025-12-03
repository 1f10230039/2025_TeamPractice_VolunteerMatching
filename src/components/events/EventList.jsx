"use client";

import styled from "@emotion/styled";
import EventCard from "./EventsCard";

const ListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
  margin-top: 16px;
`;

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
  // イベントがない場合の表示
  if (!events || events.length === 0) {
    return <p>表示できるイベントがありません。</p>;
  }

  return (
    <ListContainer>
      {events.map(event => {
        // お気に入り状態の判定
        // DB上のID型(number)と、状態管理の型(stringの場合あり)の不一致を防ぐため、
        // 両方を String() で文字列化して比較する
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
            isFavorite={isFav} // 判定結果をカードに渡す
          />
        );
      })}
    </ListContainer>
  );
}
