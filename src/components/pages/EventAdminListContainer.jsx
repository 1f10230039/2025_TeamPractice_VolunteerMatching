// ボランティア登録リストコンテナコンポーネント
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import EventAdminListPage from "./EventAdminListPage";

/**
 * 管理画面(イベント一覧)のコンテナ
 */
export default function EventAdminListContainer() {
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // 1. ユーザー取得
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          alert("ログインが必要です。");
          router.push("/volunteer-registration/admin/login");
          return;
        }

        // 2. 権限チェック
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError || profile?.role !== "admin") {
          console.error("権限エラー: このユーザーは管理者ではありません。");
          alert("このページにアクセスする権限がありません。");
          router.push("/");
          return;
        }

        setIsAdmin(true);

        // 3. 全イベントデータの取得 (タグ情報含む)
        console.log("イベントデータの取得を開始します..."); // ★デバッグ用ログ

        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select(
            `
            *,
            event_tags (
              tags (
                *
              )
            )
            `
          )
          .order("created_at", { ascending: false });

        if (eventsError) {
          console.error("イベント取得エラー:", eventsError); // エラー詳細をログに出す
          throw eventsError;
        }

        console.log("取得できた生のデータ:", eventsData); // Supabaseから来たデータをログに出す

        // データの整形
        const formattedEvents = (eventsData || []).map(event => {
          const tags = event.event_tags
            ? event.event_tags
                .map(item => item.tags)
                .filter(tag => tag !== null)
            : [];

          return {
            ...event,
            tags: tags,
          };
        });

        console.log("整形後のデータ:", formattedEvents); // 整形後のデータをログに出す
        setEvents(formattedEvents);
      } catch (error) {
        console.error("管理画面読み込みエラー:", error);
        alert("データの読み込みに失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        管理者権限を確認中...
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <EventAdminListPage events={events} />;
}
