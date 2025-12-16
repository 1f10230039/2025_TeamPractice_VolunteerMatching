"use client";

import styled from "@emotion/styled";
import EventCard from "./EventsCard"; // ファイル名が EventCard.jsx なら "./EventCard" に修正してね！

// Emotion
const ListContainer = styled.div`
  display: grid;
  /* 基本は340px以上の幅で自動折り返し */
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
  margin-top: 16px;

  /* ★追加: グリッド内のアイテム全体を中央寄せにする */
  justify-content: center;

  /* ★追加: スマホなど画面幅が狭い時（400px以下など）の対応 */
  @media (max-width: 480px) {
    /* 強制的に1列にして、カード幅を画面に合わせる */
    grid-template-columns: 1fr;
    /* もしカードが大きすぎる場合は、少し小さくする設定を入れてもOK */
    /* grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); */
  }
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
