"use client";

import styled from "@emotion/styled";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  FaMapMarkerAlt,
  FaYenSign,
  FaCalendarAlt,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";

// --- Emotion Styles ---
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

/**
 * イベントカードを表示するコンポーネント
 */
export default function EventCard({
  event,
  source,
  query,
  codes,
  isFavorite: initialIsFavorite,
}) {
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
  } = event;

  const displayTags = tags || (tag ? [{ name: tag }] : []);

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // 内部でお気に入り状態を管理する State
  // 親から渡された initialIsFavorite があればそれを使い、なければ false
  const [localIsFavorite, setLocalIsFavorite] = useState(!!initialIsFavorite);

  // マウント時に「自分がお気に入りしているか」を確認しにいく
  useEffect(() => {
    // すでに親から true が渡されている場合(マイリストなど)は確認不要だけど、トップページの場合はここで確認が必要！
    const checkFavoriteStatus = async () => {
      // ユーザー確認
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // favoritesテーブルを確認
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .match({ user_id: user.id, event_id: id })
        .maybeSingle();

      if (data) {
        setLocalIsFavorite(true);
      }
    };

    checkFavoriteStatus();
  }, [id]);

  // お気に入りボタンの処理
  const handleToggleFavorite = async e => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;
    setIsLoading(true);

    try {
      // ユーザー確認
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (
          confirm(
            "お気に入り機能を使うにはログインが必要です。\nログインページに移動しますか？"
          )
        ) {
          router.push("/login");
        }
        setIsLoading(false);
        return;
      }

      // 画面の見た目を先に変えちゃう（楽観的UI更新）
      const nextStatus = !localIsFavorite;
      setLocalIsFavorite(nextStatus);

      // favorites テーブルへの操作
      if (localIsFavorite) {
        // (反転前の状態で判定)
        // 削除 (DELETE)
        const { error } = await supabase
          .from("favorites")
          .delete()
          .match({ user_id: user.id, event_id: id });
        if (error) {
          // エラーなら見た目を元に戻す
          setLocalIsFavorite(!nextStatus);
          throw error;
        }
      } else {
        // 追加 (INSERT)
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, event_id: id });
        if (error) {
          setLocalIsFavorite(!nextStatus);
          throw error;
        }
      }

      //  画面更新 (マイリストとかで一覧から消す必要がある場合に有効)
      router.refresh();
    } catch (error) {
      console.error("お気に入り更新エラー:", error.message);
      // 重複エラーなどは無視していいけど、それ以外はアラート
      if (!error.message.includes("duplicate")) {
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
          isFavorite={localIsFavorite}
          onClick={handleToggleFavorite}
          disabled={isLoading}
        >
          {localIsFavorite ? <FaHeart /> : <FaRegHeart />}
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
