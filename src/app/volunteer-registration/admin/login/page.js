// ボランティア登録管理システム
// 管理者ログインページのサーバーコンポーネント

import AdminLoginPage from "@/components/pages/VolunteerRegistrationAdminLoginPage";
import { Suspense } from "react";

export default function Page() {
  // データを何も持たせずに、AdminLoginPage を呼び出すだけ
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <AdminLoginPage />
    </Suspense>
  );
}
