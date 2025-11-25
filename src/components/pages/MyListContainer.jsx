// src/components/pages/MyListContainer.jsx

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // クライアント用
import MyListPage from "./MyListPage"; // あなたが作った表示用コンポーネント
import AuthPrompt from "@/components/auth/AuthPrompt"; // 未ログイン時の案内

export default function MyListContainer() {
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [appliedEvents, setAppliedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. ログインチェック
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

        // 2. データ取得（お気に入りと応募済みを並行して取得）
        const favoritePromise = supabase
          .from("events")
          .select("*")
          .eq("favorite", true);

        const appliedPromise = supabase
          .from("events")
          .select("*")
          .eq("applied", true);

        const [favoriteRes, appliedRes] = await Promise.all([
          favoritePromise,
          appliedPromise,
        ]);

        if (favoriteRes.error) throw favoriteRes.error;
        if (appliedRes.error) throw appliedRes.error;

        setFavoriteEvents(favoriteRes.data || []);
        setAppliedEvents(appliedRes.data || []);
      } catch (error) {
        console.error("マイリスト取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ローディング中
  if (loading) {
    return <div style={{ padding: "24px" }}>読み込み中...</div>;
  }

  // 未ログイン時
  if (!isLoggedIn) {
    return <AuthPrompt message="マイリストを見るにはログインが必要です。" />;
  }

  // ログイン済み＆データ取得完了時
  // ここで、元々あった MyListPage にデータを渡して表示させる
  return (
    <MyListPage
      initialFavoriteEvents={favoriteEvents}
      initialAppliedEvents={appliedEvents}
    />
  );
}
