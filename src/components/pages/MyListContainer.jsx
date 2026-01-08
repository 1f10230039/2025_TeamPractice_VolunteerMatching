// マイリストコンテナコンポーネント
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import MyListPage from "./MyListPage";
import AuthPrompt from "@/components/auth/AuthPrompt";
import SkeletonList from "../events/SkeletonList";

/**
 * マイリストページのコンテナ (Container)
 *
 * 役割:
 * 1. ログイン状態のチェック
 * 2. Supabaseから「お気に入り」「応募済み」データを取得 (JOINを利用)
 * 3. 取得したデータを整形し、表示用コンポーネントに渡す
 */
export default function MyListContainer() {
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [appliedEvents, setAppliedEvents] = useState([]);
  // ハート判定用IDリスト
  const [userFavoriteIds, setUserFavoriteIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. ログインユーザーの確認
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }

        setIsLoggedIn(true);

        // 2. データ取得（お気に入りと応募済みを並行取得）

        // favorites テーブルから events と tags を結合して取得
        const favoritePromise = supabase
          .from("favorites")
          .select(
            `
            events (
              *,
              tags ( * )
            )
          `
          )
          .eq("user_id", user.id);

        // applications テーブルから取得
        const appliedPromise = supabase
          .from("applications")
          .select(
            `
            events (
              *,
              tags ( * )
            )
          `
          )
          .eq("user_id", user.id);

        const [favoriteRes, appliedRes] = await Promise.all([
          favoritePromise,
          appliedPromise,
        ]);

        if (favoriteRes.error) throw favoriteRes.error;
        if (appliedRes.error) throw appliedRes.error;

        // 3. データ整形
        // ネスト構造 [ { events: {...} } ] から、純粋なイベントリスト [ {...} ] に変換
        const formattedFavorites = (favoriteRes.data || [])
          .map(item => item.events)
          .filter(Boolean);

        const formattedApplied = (appliedRes.data || [])
          .map(item => item.events)
          .filter(Boolean);

        setFavoriteEvents(formattedFavorites);
        setAppliedEvents(formattedApplied);

        // ハートを赤く表示するためのIDリストを作成
        // 型不一致を防ぐため、Number() で確実に数値に変換する
        const ids = formattedFavorites.map(event => Number(event.id));
        setUserFavoriteIds(ids);
      } catch (error) {
        console.error("マイリスト取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "24px" }}>
        <SkeletonList count={6} />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AuthPrompt message="マイリストを見るにはログインが必要です。" />;
  }

  return (
    <MyListPage
      initialFavoriteEvents={favoriteEvents}
      initialAppliedEvents={appliedEvents}
      userFavoriteIds={userFavoriteIds}
    />
  );
}
