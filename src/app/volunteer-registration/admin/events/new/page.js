// 新規作成ページコンポーネント
import EventAdminFormContainer from "@/components/pages/EventAdminFormContainer";

// ページ本体
export default function NewEventPage() {
  // 新規作成モードなので ID は渡さない
  return <EventAdminFormContainer />;
}
