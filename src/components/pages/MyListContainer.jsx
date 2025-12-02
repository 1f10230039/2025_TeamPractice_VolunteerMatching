"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // クライアント用Supabase
import MyListPage from "./MyListPage"; // 表示用コンポーネント(UI)
import AuthPrompt from "@/components/auth/AuthPrompt"; // 未ログイン時の案内

/**
 * マイリストページのコンテナ (Container)
 *
 * 役割:
 * 1. ログイン状態のチェック
 * 2. Supabaseから「お気に入り」「応募済み」データを取得
 * 3. ★追加: ハートを赤くするための「お気に入りIDリスト」を作成
 * 4. データを表示用コンポーネントに渡す
 */
export default function MyListContainer() {
  // --- 状態管理 (State) ---
  const [favoriteEvents, setFavoriteEvents] = useState([]); // お気に入りイベント詳細データ
  const [appliedEvents, setAppliedEvents] = useState([]); // 応募済みイベント詳細データ

  // ★追加: ユーザーがお気に入り登録しているイベントIDのリスト (ハートの色判定用)
  const [userFavoriteIds, setUserFavoriteIds] = useState([]);

  const [loading, setLoading] = useState(true); // 読み込み中フラグ
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ログイン済みフラグ

  /**
   * 画面表示時に実行されるデータ取得処理
   */
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

        // 2. データ取得（お気に入りと応募済みを並行してリクエスト）

        // A. お気に入りテーブルから取得 (イベント情報とタグ情報も結合)
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

        // B. 応募済みテーブルから取得
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

        // 両方の完了を待つ
        const [favoriteRes, appliedRes] = await Promise.all([
          favoritePromise,
          appliedPromise,
        ]);

        if (favoriteRes.error) throw favoriteRes.error;
        if (appliedRes.error) throw appliedRes.error;

        // 3. データの整形 (ネストされた構造から events だけを取り出す)
        const formattedFavorites = (favoriteRes.data || [])
          .map(item => item.events)
          .filter(Boolean);

        const formattedApplied = (appliedRes.data || [])
          .map(item => item.events)
          .filter(Boolean);

        // Stateに保存
        setFavoriteEvents(formattedFavorites);
        setAppliedEvents(formattedApplied);

        // ★追加: お気に入りイベントの「IDだけ」を集めた配列を作る
        // (例: [1, 5, 8] )
        // これを EventList に渡すことで、該当するイベントのハートが赤くなる
        const ids = formattedFavorites.map(event => event.id);
        setUserFavoriteIds(ids);
      } catch (error) {
        console.error("マイリスト取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- 表示の切り替え ---

  if (loading) {
    return <div style={{ padding: "24px" }}>読み込み中...</div>;
  }

  if (!isLoggedIn) {
    return <AuthPrompt message="マイリストを見るにはログインが必要です。" />;
  }

  // データを表示用コンポーネントに渡す
  return (
    <MyListPage
      initialFavoriteEvents={favoriteEvents}
      initialAppliedEvents={appliedEvents}
      userFavoriteIds={userFavoriteIds} // ★ここが重要！IDリストを渡す
    />
  );
}
