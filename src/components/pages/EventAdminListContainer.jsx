"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import EventAdminListPage from "./EventAdminListPage"; // 既存の表示用コンポーネント

/**
 * 管理画面(イベント一覧)のコンテナ
 *
 * 役割:
 * 1. ログイン & 管理者権限(role === 'admin') のチェック
 * 2. 全イベントデータの取得 (タグ情報含む)
 * 3. 表示用コンポーネントへのデータ渡し
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
          router.push("/volunteer-registration/admin/login"); // 管理者用ログインへ
          return;
        }

        // 2. 権限チェック (profilesテーブルの role を見る)
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError || profile?.role !== "admin") {
          console.error("権限エラー: このユーザーは管理者ではありません。");
          alert("このページにアクセスする権限がありません。");
          router.push("/"); // トップページへ強制送還
          return;
        }

        // ここまで来れば管理者確定
        setIsAdmin(true);

        // 3. 全イベントデータの取得 (tagsも結合)
        // 管理画面なので、全て(全件)取得する
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select(
            `
            *,
            tags ( * )
          `
          )
          .order("created_at", { ascending: false }); // 新しい順

        if (eventsError) throw eventsError;

        setEvents(eventsData || []);
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

  // 管理者でなければ何も表示しない (useEffectでリダイレクト済みだが、念のため)
  if (!isAdmin) {
    return null;
  }

  // 権限OKなら、一覧ページを表示
  return <EventAdminListPage events={events} />;
}
