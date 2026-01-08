// 新規作成、編集ページ
import ActivityLogForm from "@/components/activity-log/ActivityLogForm";
import { Suspense } from "react";

/// ロジックは全てクライアント側の Form コンポーネントに委譲する
export default function Page() {
  // Suspenseでラップしてコンテナを表示
  return (
    <Suspense fallback={<div>フォームを読み込み中...</div>}>
      <ActivityLogForm />
    </Suspense>
  );
}
