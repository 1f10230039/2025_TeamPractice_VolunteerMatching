"use client";

import styled from "@emotion/styled";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Emotion
// カード全体
const CardContainer = styled(Link)`
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease-in-out;
  display: block;
  text-decoration: none;
  color: inherit;

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

  /* 連打防止用に、ローディング中はカーソルを変える */
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
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
 * @param {{ event: object }} props - イベントデータオブジェクト
 */
export default function EventCard({ event }) {
  const {
    id,
    name,
    tag,
    place,
    fee,
    start_datetime,
    end_datetime,
    image_url,
    favorite,
  } = event;

  // お気に入りボタンのクリック処理
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false); // 連打防止用

  // お気に入り状態をトグルする関数
  const handleToggleFavorite = async e => {
    // ボタンをクリックした時に、親のLink(CardContainer)が発動しないようにする
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return; // ローディング中は処理しない
    setIsLoading(true);

    // 今の favorite の逆の状態 (trueならfalse、falseならtrue)
    const newFavoriteStatus = !favorite;

    // Supabaseの "events" テーブルをアップデート
    const { error } = await supabase
      .from("events")
      .update({ favorite: newFavoriteStatus }) // 'favorite' カラムを更新
      .eq("id", id); // この 'id' のイベントだけ

    if (error) {
      console.error("お気に入り更新エラー:", error.message);
    } else {
      // 成功したら、ページ全体をリフレッシュする
      router.refresh();
    }

    setIsLoading(false);
  };

  return (
    <CardContainer href={`/events/${id}`}>
      <ImageWrapper>
        <EventImage
          src={
            image_url || "https://placehold.co/130x150/e0e0e0/777?text=No+Image"
          }
          alt={name}
        />
        <FavoriteButton
          isFavorite={favorite}
          onClick={handleToggleFavorite}
          disabled={isLoading}
        >
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
