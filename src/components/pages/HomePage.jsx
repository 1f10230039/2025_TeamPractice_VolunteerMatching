"use client";

import styled from "@emotion/styled";
import EventList from "../events/EventList";

// Emotion
const HomeContainer = styled.div`
  padding: 24px;
`;

/**
 * ページ全体のレイアウトと状態を管理するコンポーネント
 * @param {{ events: object[] }} props - page.jsから渡される全イベントデータ
 */
export default function HomePage({ events }) {
  return (
    <HomeContainer>
      <h1>ホーム</h1>
      <section>
        <h2>おすすめイベント</h2>
        <EventList events={events} />
      </section>
    </HomeContainer>
  );
}
