// ボランティア活動記録 一覧ページ
import ActivityLogContainer from "@/components/pages/ActivityLogContainer";

// ロジックは全てクライアント側の Container に委譲する
export default function Page() {
  // Suspenseでラップしてコンテナを表示
  return <ActivityLogContainer />;
}
