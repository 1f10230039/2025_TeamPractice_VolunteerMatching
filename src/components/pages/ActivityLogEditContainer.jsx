// 活動記録編集コンテナコンポーネント
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ActivityLogForm from "@/components/activity-log/ActivityLogForm";

export default function ActivityLogEditContainer({ activityLogId }) {
  const router = useRouter();

  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ログインチェック
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

        // データ取得 (クライアントサイドで実行)
        const { data, error } = await supabase
          .from("activity_log")
          .select("*")
          .eq("id", activityLogId)
          .single();

        if (error) throw error;

        setLog(data);
      } catch (error) {
        console.error("活動記録の取得エラー:", error);
        alert("データの取得に失敗しました。");
        // router.push("/activity-log");
      } finally {
        setLoading(false);
      }
    };

    if (activityLogId) {
      fetchData();
    }
  }, [activityLogId, router]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>読み込み中...</div>
    );
  }

  // 未ログインの場合
  if (!isLoggedIn) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>編集するにはログインが必要です。</p>
        <a
          href="/login"
          style={{ color: "#007bff", textDecoration: "underline" }}
        >
          ログインする
        </a>
      </div>
    );
  }

  // データが取れなかった場合
  if (!log) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        記録が見つかりませんでした。
      </div>
    );
  }

  // データが取れたらフォームを表示
  return <ActivityLogForm logToEdit={log} />;
}
