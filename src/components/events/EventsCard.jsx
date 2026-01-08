// イベントカードコンポーネント
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
// カード全体のスタイル
const CardContainer = styled(Link)`
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 4px 20px rgba(122, 211, 232, 0.15);
  transition: transform 0.2s ease-in-out;
  display: block;
  text-decoration: none;
  color: inherit;

  &:hover {
    transform: translateY(-5px);
  }
`;

// 画像ラッパーと画像スタイル
const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 280px;
`;

// 画像スタイル
const EventImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 6px;
  object-fit: cover;
`;

// お気に入りボタンスタイル
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

// カード内容部分のスタイル
const CardContent = styled.div`
  padding: 16px;
`;

// イベント名スタイル
const EventName = styled.h3`
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0 0 8px 0;
`;

// タグコンテナ
const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

// タグスタイル
const Tag = styled.span`
  display: inline-block;
  background-color: #f0f0f0;
  color: #555;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
`;

// 情報行スタイル
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

// 日付範囲をフォーマットするヘルパー関数
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

// --- EventCard Component ---
export default function EventCard({
  event,
  source,
  query,
  codes,
  isFavorite: initialIsFavorite,
}) {
  // イベント情報の分割代入
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

  // タグ情報の整形
  const displayTags = tags || (tag ? [{ name: tag }] : []);
  // ルーターとローカルステートの初期化
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // 内部でお気に入り状態を管理する State
  // 親から渡された initialIsFavorite があればそれを使い、なければ false
  const [localIsFavorite, setLocalIsFavorite] = useState(!!initialIsFavorite);

  // マウント時に「自分がお気に入りしているか」を確認しにいく
  useEffect(() => {
    // 非同期関数を定義して即時実行
    const checkFavoriteStatus = async () => {
      // ユーザー確認
      const {
        data: { user },
      } = await supabase.auth.getUser();
      // もし未ログインなら終了
      if (!user) return;
      // favoritesテーブルを確認
      const { data } = await supabase
        .from("favorites") // お気に入りテーブル
        .select("id") // IDだけ取得
        .match({ user_id: user.id, event_id: id }) // 自分とこのイベントの組み合わせを検索
        .maybeSingle(); // もしあれば1件取得、なければnull

      // もしデータがあればお気に入り済みとして状態を更新
      if (data) {
        setLocalIsFavorite(true);
      }
    };

    // チェック関数を実行
    checkFavoriteStatus();
  }, [id]);

  // お気に入りボタンの処理
  const handleToggleFavorite = async e => {
    e.preventDefault();
    e.stopPropagation();
    // もし処理中なら何もしない
    if (isLoading) return;
    // ローディング開始
    setIsLoading(true);
    // 非同期でお気に入り状態を更新
    try {
      // ユーザー確認
      const {
        data: { user },
      } = await supabase.auth.getUser();
      // もし未ログインならログイン促進
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

      // 画像のお気に入り状態を反転(楽観的UI更新)
      const nextStatus = !localIsFavorite;
      setLocalIsFavorite(nextStatus);

      // favorites テーブルへの操作
      if (localIsFavorite) {
        // 削除 (DELETE)
        const { error } = await supabase
          .from("favorites") // お気に入りテーブル
          .delete() // 削除操作
          .match({ user_id: user.id, event_id: id }); // 自分とこのイベントの組み合わせを検索
        // もしエラーがあれば見た目を元に戻す
        if (error) {
          // エラーなら見た目を元に戻す
          setLocalIsFavorite(!nextStatus);
          throw error;
        }
        // 成功ならそのまま
      } else {
        // 追加 (INSERT)
        const { error } = await supabase
          .from("favorites") // お気に入りテーブル
          .insert({ user_id: user.id, event_id: id }); // レコード追加
        // もしエラーがあれば見た目を元に戻す
        if (error) {
          setLocalIsFavorite(!nextStatus);
          throw error;
        }
      }

      // 成功したらページをリフレッシュして最新状態に
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

  // 詳細ページのURLを構築
  const detailUrl = (() => {
    const base = `/events/${id}`;
    const params = new URLSearchParams();
    if (source) params.append("source", source);
    if (source === "keyword" && query) params.append("q", query);
    else if (source === "location" && codes) params.append("codes", codes);
    const queryString = params.toString();
    return queryString ? `${base}?${queryString}` : base;
  })();

  // レンダリング
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
