// src/components/search/SearchHistoryRecorder.jsx
"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SearchHistoryRecorder({ query }) {
  // 「最後に保存したキーワード」を覚えておくためのメモ帳を用意
  const lastSavedQuery = useRef(null);

  useEffect(() => {
    const saveHistory = async () => {
      // ログイン情報を取得
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // ログインしてない、またはキーワードが無効なら何もしない
      if (!user || !query || query.trim().length < 2) return;

      if (lastSavedQuery.current === query) return;

      lastSavedQuery.current = query;

      const trimmedQuery = query.trim();

      // 重複削除
      await supabase
        .from("search_history")
        .delete()
        .eq("query", trimmedQuery)
        .eq("user_id", user.id);

      // 3. 保存
      const { error } = await supabase.from("search_history").insert({
        query: trimmedQuery,
        user_id: user.id,
      });

      if (error) {
        console.error("履歴保存エラー:", error.message);
      } else {
        console.log("検索履歴を保存しました:", trimmedQuery);
      }
    };

    saveHistory();
  }, [query]); // queryが変わるたびに実行

  // 画面には何も表示しない
  return null;
}
