// 新規作成、編集ページ (サーバーコンポーネント)

import ActivityLogForm from "@/components/activity-log/ActivityLogForm";
import { Suspense } from "react";

// 新規作成ページ
export default function Page() {
  return (
    <Suspense fallback={<div>フォームを読み込み中...</div>}>
      <ActivityLogForm />
    </Suspense>
  );
}
