"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import ActivityLogDetailPage from "./ActivityLogDetailPage";
// import { useRouter } from "next/navigation"; // 必要なら使う

export default function ActivityLogDetailContainer({ activityLogId }) {
  // const router = useRouter();

  const [log, setLog] = useState(null);
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
          // router.push("/login"); // 強制リダイレクトしたい場合はコメントアウトを外す
          return;
        }

        setIsLoggedIn(true);

        // 2. データ取得 (クライアントサイドで実行)
        // RLSのおかげで、自分のデータなら取得できるはず！
        const { data, error } = await supabase
          .from("activity_log")
          .select("*")
          .eq("id", activityLogId)
          .single();

        if (error) throw error;

        setLog(data);
      } catch (error) {
        console.error("活動記録の取得エラー:", error);
        // エラーハンドリングはお好みで（アラート出すとか）
      } finally {
        setLoading(false);
      }
    };

    if (activityLogId) {
      fetchData();
    }
  }, [activityLogId]);

  // ローディング中
  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
        読み込み中...
      </div>
    );
  }

  // 未ログインの場合
  if (!isLoggedIn) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ marginBottom: "16px" }}>
          活動記録を見るにはログインが必要です。
        </p>
        <a
          href="/login"
          style={{
            color: "#007bff",
            textDecoration: "underline",
            fontWeight: "bold",
          }}
        >
          ログインする
        </a>
      </div>
    );
  }

  // データが取れなかった場合
  if (!log) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
        記録が見つかりませんでした。
      </div>
    );
  }

  // データが取れたら詳細ページを表示！
  return <ActivityLogDetailPage log={log} />;
}
