// プロフィール編集コンテナコンポーネント
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProfileEditPage from "./ProfileEditPage";
import AuthPrompt from "@/components/auth/AuthPrompt";

/**
 * プロフィール編集ページのコンテナ (Container)
 *
 * 役割:
 * 1. ログイン認証チェックを行う
 * 2. 編集に必要な初期データ（現在のプロフィール、大学一覧）を取得する
 * 3. 取得したデータを表示用コンポーネント (ProfileEditPage) に渡す
 */
export default function ProfileEditContainer() {
  // 状態管理
  const [profile, setProfile] = useState(null); // 現在のプロフィール
  const [universities, setUniversities] = useState([]); // 大学マスタデータ
  const [loading, setLoading] = useState(true); // 読み込み中フラグ
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ログインフラグ

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

        // 2. データ取得（並行処理）
        // 編集画面に必要な「自分のプロフィール」と「大学リスト」を同時に取ってくる
        const profilePromise = supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        const uniPromise = supabase.from("universities").select("id, name");

        // Promise.all で両方の完了を待つ
        const [profileRes, uniRes] = await Promise.all([
          profilePromise,
          uniPromise,
        ]);

        // エラーチェック
        if (profileRes.error) throw profileRes.error;
        if (uniRes.error) throw uniRes.error;

        // データをStateに保存
        setProfile(profileRes.data);
        setUniversities(uniRes.data || []);
      } catch (error) {
        console.error("データ取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 条件分岐による表示切り替え
  if (loading) return <div style={{ padding: "24px" }}>読み込み中...</div>;
  if (!isLoggedIn)
    return <AuthPrompt message="編集するにはログインが必要です。" />;

  // データが揃ったら、表示用コンポーネント(家)に渡して描画する
  return (
    <ProfileEditPage initialProfile={profile} universities={universities} />
  );
}
