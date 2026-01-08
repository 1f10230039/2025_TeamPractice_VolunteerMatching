// ボランティア活動記録 詳細ページ
import ActivityLogDetailContainer from "@/components/pages/ActivityLogDetailContainer";
import { Suspense } from "react";

// ロジックは全てクライアント側の Container に委譲する
export default async function Page({ params }) {
  // パラメータからIDを取得
  const { id } = await params;

  // Suspenseでラップしてコンテナを表示
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <ActivityLogDetailContainer activityLogId={id} />
    </Suspense>
  );
}
