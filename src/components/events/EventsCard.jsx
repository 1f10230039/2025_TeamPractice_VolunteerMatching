"use client";

import styled from "@emotion/styled";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  FaMapMarkerAlt,
  FaYenSign,
  FaCalendarAlt,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";

// --- Emotion Styles (そのまま) ---
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
const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 180px;
`;
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
  & > svg {
    width: 22px;
    height: 22px;
    color: ${props => (props.isFavorite ? "#e74c3c" : "#ccc")};
    transition: color 0.1s ease;
  }
`;
const CardContent = styled.div`
  padding: 16px;
`;
const EventName = styled.h3`
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0 0 8px 0;
`;
const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;
const Tag = styled.span`
  display: inline-block;
  background-color: #f0f0f0;
  color: #555;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
`;
const InfoRow = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 6px;
  & > svg {
    margin-right: 8px;
    width: 0.9rem;
    height: 0.9rem;
    color: #888;
  }
`;

const formatDateRange = (startStr, endStr) => {
  try {
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);
    const options = { month: "numeric", day: "numeric" };
    const start = startDate.toLocaleDateString("ja-JP", options);
    const end = endDate.toLocaleDateString("ja-JP", options);
    return start === end ? start : `${start} - ${end}`;
  } catch (e) {
    return "日付情報なし";
  }
};

export default function EventCard({ event, source, query, codes, isFavorite }) {
  const {
    id,
    name,
    tag,
    tags,
    place,
    fee,
    start_datetime,
    end_datetime,
    image_url,
    // favorite, ← ★ 古いカラムは無視！絶対に使わない！
  } = event;

  const displayTags = tags || (tag ? [{ name: tag }] : []);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // ★ お気に入りボタンの処理 (favoritesテーブルへ)
  const handleToggleFavorite = async e => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;
    setIsLoading(true);

    try {
      // 1. ユーザー確認
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("お気に入り機能を使うにはログインが必要です。");
        setIsLoading(false);
        return;
      }

      // 2. favorites テーブルへの操作
      if (isFavorite) {
        // 削除 (DELETE)
        const { error } = await supabase
          .from("favorites")
          .delete()
          .match({ user_id: user.id, event_id: id });
        if (error) throw error;
      } else {
        // 追加 (INSERT)
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, event_id: id });
        if (error) throw error;
      }

      // 3. 画面更新
      router.refresh();
    } catch (error) {
      console.error("お気に入り更新エラー:", error.message);
      // 重複エラーは無視してリフレッシュ
      if (error.message.includes("duplicate")) {
        router.refresh();
      } else {
        alert("処理に失敗しました。");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const detailUrl = (() => {
    const base = `/events/${id}`;
    const params = new URLSearchParams();
    if (source) params.append("source", source);
    if (source === "keyword" && query) params.append("q", query);
    else if (source === "location" && codes) params.append("codes", codes);
    const queryString = params.toString();
    return queryString ? `${base}?${queryString}` : base;
  })();

  return (
    <CardContainer href={detailUrl}>
      <ImageWrapper>
        <EventImage
          src={
            image_url || "https://placehold.co/130x150/e0e0e0/777?text=No+Image"
          }
          alt={name}
        />
        <FavoriteButton
          isFavorite={isFavorite} // ★ 親から受け取った判定結果を使う
          onClick={handleToggleFavorite}
          disabled={isLoading}
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </FavoriteButton>
      </ImageWrapper>
      <CardContent>
        {displayTags.length > 0 && (
          <TagContainer>
            {displayTags.map((t, index) => (
              <Tag key={index}>{t.name || t}</Tag>
            ))}
          </TagContainer>
        )}
        <EventName>{name}</EventName>
        <InfoRow>
          <FaMapMarkerAlt />
          {place || "場所未定"}
        </InfoRow>
        <InfoRow>
          <FaYenSign />
          {!fee ? "無料" : `${fee.toLocaleString()}円`}
        </InfoRow>
        <InfoRow>
          <FaCalendarAlt />
          {formatDateRange(start_datetime, end_datetime)}
        </InfoRow>
      </CardContent>
    </CardContainer>
  );
}
