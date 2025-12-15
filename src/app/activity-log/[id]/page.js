import ActivityLogDetailContainer from "@/components/pages/ActivityLogDetailContainer";
import { Suspense } from "react";

/**
 * 活動記録詳細ページ (Server Component)
 * ロジックは全てクライアント側の Container に委譲する
 */
export default async function Page({ params }) {
  const { id } = await params;

  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <ActivityLogDetailContainer activityLogId={id} />
    </Suspense>
  );
}
