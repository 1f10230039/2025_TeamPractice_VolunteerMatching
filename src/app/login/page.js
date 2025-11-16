// src/app/login/page.js

import LoginPage from "@/components/pages/LoginPage.jsx";

/**
 * ログインページのコンテナ（サーバーコンポーネント）
 *
 * サーバー側でのデータ取得は不要なため、
 * クライアントコンポーネント(LoginPage)を呼び出すだけ。
 */
export default function LoginPageContainer() {
  return <LoginPage />;
}
