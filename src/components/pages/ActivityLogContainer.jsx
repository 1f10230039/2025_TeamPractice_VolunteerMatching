"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import ActivityLogListPage from "./ActivityLogListPage"; // 既存の表示用コンポーネント
import { useRouter } from "next/navigation";

export default function ActivityLogContainer() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // 1. ログインチェック
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          // 未ログインならログインページへ飛ばすか、未ログイン表示にする
          setIsLoggedIn(false);
          setLoading(false);
          // router.push("/login"); // 強制リダイレクトしたい場合はコメントアウトを外す
          return;
        }

        setIsLoggedIn(true);

        // 2. データ取得
        // RLS（ポリシー）を設定したから、単に select('*') するだけで
        // 自動的に「自分のデータだけ」が返ってくる
        const { data, error } = await supabase
          .from("activity_log")
          .select("*")
          .order("datetime", { ascending: false });

        if (error) throw error;

        setLogs(data || []);
      } catch (error) {
        console.error("活動記録の取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [router]);

  // ローディング中
  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>読み込み中...</div>
    );
  }

  // 未ログインの場合
  if (!isLoggedIn) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <p>活動記録を見るにはログインが必要です。</p>
        <a
          href="/login"
          style={{ color: "#007bff", textDecoration: "underline" }}
        >
          ログインする
        </a>
      </div>
    );
  }

  // ログイン済み＆データ取得完了なら、表示用コンポーネントに渡す
  return <ActivityLogListPage initialLogs={logs} />;
}
