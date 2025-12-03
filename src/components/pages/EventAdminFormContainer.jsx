"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import EventAdminForm from "@/components/events/EventAdminForm"; // 既存のフォームコンポーネント

/**
 * 管理画面(フォーム)のコンテナ
 * * 役割:
 * 1. ログイン & 管理者権限チェック
 * 2. (編集モードの場合) 対象データの取得
 * 3. フォームコンポーネントの表示
 * * @param {{ eventId?: string }} props - 編集時はIDが渡ってくる
 */
export default function EventAdminFormContainer({ eventId }) {
  const router = useRouter();

  const [eventData, setEventData] = useState(null); // 編集用データ
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
          alert("このページにアクセスする権限がありません。");
          router.push("/");
          return;
        }

        setIsAdmin(true);

        // 3. (編集モードなら) データ取得
        if (eventId) {
          const { data, error } = await supabase
            .from("events")
            .select(
              `
              *,
              tags ( * )
            `
            )
            .eq("id", eventId)
            .single();

          if (error) throw error;
          setEventData(data);
        }
      } catch (error) {
        console.error("管理画面エラー:", error);
        alert("エラーが発生しました。一覧に戻ります。");
        router.push("/volunteer-registration/admin/events");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [eventId, router]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>確認中...</div>
    );
  }

  if (!isAdmin) return null;

  // 権限OKならフォームを表示
  // eventData があれば「編集モード」、なければ「新規作成モード」として動く
  return <EventAdminForm eventToEdit={eventData} />;
}
