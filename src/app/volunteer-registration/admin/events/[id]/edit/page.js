// 編集ページコンポーネント
import React from "react";
import EventAdminFormContainer from "@/components/pages/EventAdminFormContainer";

// ページ本体
export default async function EditEventPage({ params }) {
  // パラメータからIDを取得
  const { id } = await params;
  // 編集モードなので ID を渡す
  return <EventAdminFormContainer eventId={id} />;
}
