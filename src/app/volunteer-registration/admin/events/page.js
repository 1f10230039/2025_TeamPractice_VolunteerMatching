// 管理者用イベント一覧ページコンポーネント
import EventAdminListContainer from "@/components/pages/EventAdminListContainer";

// ロジックは全てクライアント側のコンポーネントに委譲する
export default function AdminEventsPage() {
  // イベント一覧コンテナを表示
  return <EventAdminListContainer />;
}
