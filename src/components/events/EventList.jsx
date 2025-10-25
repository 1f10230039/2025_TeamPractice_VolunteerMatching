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
 * @param {{ events: object[] }} props - 親コンポーネントから渡されるイベントデータ配列
 */
export default function EventList({ events }) {
  // もしイベントが1件もなかったら
  if (!events || events.length === 0) {
    return <p>表示できるイベントがありません。</p>;
  }

  // イベントがある場合は、mapでEventCardを並べる
  return (
    <ListContainer>
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </ListContainer>
  );
}
