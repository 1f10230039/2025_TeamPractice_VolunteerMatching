// 管理者用ログインページコンポーネント
import AdminLoginPage from "@/components/pages/VolunteerRegistrationAdminLoginPage";
import { Suspense } from "react";

// ロジックは全てクライアント側のコンポーネントに委譲する
export default function Page() {
  // コンテナを表示
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <AdminLoginPage />
    </Suspense>
  );
}
