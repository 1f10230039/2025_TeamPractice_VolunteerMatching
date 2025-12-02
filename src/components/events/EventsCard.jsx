"use client";

import styled from "@emotion/styled";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import { FaMapMarkerAlt, FaYenSign, FaCalendarAlt } from "react-icons/fa";
import { FaHeart, FaRegHeart } from "react-icons/fa";

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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  /* 連打防止用に、ローディング中はカーソルを変える */
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

// カードの中身
const CardContent = styled.div`
  padding: 16px;
`;

const EventName = styled.h3`
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0 0 8px 0;
`;

// タグを囲むコンテナ
const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
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

  & > svg {
    margin-right: 8px;
    width: 0.9rem;
    height: 0.9rem;
    color: #888;
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
    // favorite, ← eventテーブルのfavoriteカラムはもう使わない
  } = event;

  // タグの表示用配列を作成
  const displayTags = tags || (tag ? [{ name: tag }] : []);

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

    try {
      // 現在のユーザーIDを取得 (ログインしていなければ処理しない)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("お気に入り機能を使うにはログインが必要です。");
        // ログインページへ飛ばす
        router.push("/login");
        return;
      }

      if (isFavorite) {
        // ■ お気に入り解除 (favorites テーブルから削除)
        const { error } = await supabase
          .from("favorites")
          .delete()
          .match({ user_id: user.id, event_id: id }); // 自分のID かつ このイベントID

        if (error) throw error;
      } else {
        // ■ お気に入り登録 (favorites テーブルに追加)
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, event_id: id });

        if (error) throw error;
      }

      // 成功したら画面を更新
      router.refresh();
    } catch (error) {
      console.error("お気に入り更新エラー:", error.message);

      //「すでに登録済み」エラーなら、成功したことにしてリフレッシュする
      if (error.message.includes("duplicate key value")) {
        router.refresh(); // 強制的に画面を更新して、正しい状態(赤ハート)に戻す
      } else {
        alert("処理に失敗しました。");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // イベント詳細ページへのリンクURLを作成
  const detailUrl = (() => {
    const base = `/events/${id}`;
    // クエリパラメータを組み立てる
    const params = new URLSearchParams();
    // 検索元ページの情報を付与
    if (source) {
      params.append("source", source);
    }

    // 検索キーワードや場所コードの情報を付与
    if (source === "keyword" && query) {
      params.append("q", query);
    } else if (source === "location" && codes) {
      params.append("codes", codes);
    }
    // クエリ文字列を組み立てる(source === 'mylist' の時は、'source=mylist' だけが付く)
    const queryString = params.toString();
    // クエリが何かあれば `?` を付けて、なければベースURLだけを返す
    return queryString ? `${base}?${queryString}` : base;
  })(); // () で関数を即時実行

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
          isFavorite={isFavorite} // propsから受け取った状態を使う
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
