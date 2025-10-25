"use client";

import styled from "@emotion/styled";
import EventList from "../events/EventList";
import SearchOptions from "../search/SearchOptions";

// Emotion
// ページ全体のコンテナスタイル
const SearchSection = styled.section`
  margin-bottom: 40px;
  background-color: #97cdf3;
  padding: 24px;
`;
const EventSection = styled.section`
  margin-bottom: 40px;
  padding: 24px;
`;

/**
 * ページ全体のレイアウトと状態を管理するコンポーネント
 * @param {{ events: object[] }} props - page.jsから渡される全イベントデータ
 */
export default function HomePage({ events }) {
  return (
    <section>
      <SearchSection>
        <SearchOptions />
      </SearchSection>
      <EventSection>
        <h2>おすすめイベント</h2>
        <EventList events={events} />
      </EventSection>
    </section>
  );
}
