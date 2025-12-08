import ActivityLogEditContainer from "@/components/pages/ActivityLogEditContainer";
import { Suspense } from "react";

/**
 * 編集ページ (Server Component)
 * ロジックは全てクライアント側の Container に委譲する
 */
export default async function Page({ params }) {
  const { id } = await params;

  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <ActivityLogEditContainer activityLogId={id} />
    </Suspense>
  );
}
