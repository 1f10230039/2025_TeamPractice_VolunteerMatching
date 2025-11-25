// src/app/mypage/edit/page.js

import ProfileEditContainer from "@/components/pages/ProfileEditContainer";

/**
 * プロフィール編集ページのルートコンポーネント (Server Component)
 *
 * ここではロジックを持たず、クライアント側のコンテナ (ProfileEditContainer) を呼び出すだけです。
 * 認証チェックやデータ取得は、すべてクライアント側で行います。
 */
export default function Page() {
  return <ProfileEditContainer />;
}
