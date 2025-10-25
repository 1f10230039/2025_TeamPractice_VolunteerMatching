"use client";

import styled from "@emotion/styled";

// Emotion
// カード全体
const CardContainer = styled.div`
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
  }
`;

// 画像部分
const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 180px;
`;

// イベント画像
const EventImage = styled.img`
  width: 100%;
  height: 180px;
  border-radius: 6px;
  object-fit: cover;
  margin-right: 16px;
`;

// お気に入りボタン
const FavoriteButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: ${props => (props.isFavorite ? "red" : "#ccc")};
`;

// カードの中身
const CardContent = styled.div`
  padding: 16px;
`;

const EventName = styled.h3`
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0 0 8px 0;
`;

// タグ用のスタイル
const Tag = styled.span`
  display: inline-block;
  background-color: #f0f0f0;
  color: #555;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 12px;
`;

// 場所とか費用とかの行
const InfoRow = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 6px;

  /* アイコン用の絵文字（仮） */
  & > span:first-of-type {
    margin-right: 8px;
    font-size: 1.1rem;
  }
`;

// 日付をフォーマットする簡単な関数
const formatDateRange = (startStr, endStr) => {
  try {
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    // オプションを細かく指定して「月/日」だけ表示
    const options = { month: "numeric", day: "numeric" };
    const start = startDate.toLocaleDateString("ja-JP", options);
    const end = endDate.toLocaleDateString("ja-JP", options);

    if (start === end) {
      return start;
    }
    return `${start} - ${end}`;
  } catch (e) {
    return "日付情報なし";
  }
};

/**
 * イベントカードを表示するコンポーネント
 * @param {{ event: object }} props - 親コンポーネントから渡されるイベントデータ
 */
export default function EventCard({ event }) {
  const {
    name,
    tag,
    place,
    fee,
    start_datetime,
    end_datetime,
    image_url,
    favorite,
  } = event;

  return (
    <CardContainer>
      <ImageWrapper>
        <EventImage
          src={
            image_url || "https://placehold.co/130x150/e0e0e0/777?text=No+Image"
          }
          alt={name}
        />
        <FavoriteButton isFavorite={favorite}>
          {favorite ? "♥" : "♡"}
        </FavoriteButton>
      </ImageWrapper>
      <CardContent>
        {tag && <Tag>{tag}</Tag>}

        <EventName>{name}</EventName>

        <InfoRow>
          <span>📍</span>
          {place || "場所未定"}
        </InfoRow>

        <InfoRow>
          <span>💰</span>
          {!fee ? "無料" : `${fee.toLocaleString()}円`}
        </InfoRow>

        <InfoRow>
          <span>🗓️</span>
          {formatDateRange(start_datetime, end_datetime)}
        </InfoRow>
      </CardContent>
    </CardContainer>
  );
}
