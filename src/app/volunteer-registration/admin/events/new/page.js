// ボランティア新規登録ページ

import EventAdminForm from "@/components/events/EventAdminForm";
import { Suspense } from "react";

// 新規登録ページ
export default function Page() {
  // データを何も持たせずに、入力フォームコンポーネントを呼び出すだけ
  // eventToEditprops を渡さないことで新規作成モードになる
  return (
    <Suspense fallback={<div>フォームを読み込み中...</div>}>
      <EventAdminForm />
    </Suspense>
  );
}
