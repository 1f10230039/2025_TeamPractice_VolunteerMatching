// ログインページのコンテナ
import LoginPage from "@/components/pages/LoginPage.jsx";

// ロジックは全てクライアント側のコンポーネントに委譲する
export default function LoginPageContainer() {
  // コンテナを表示
  return <LoginPage />;
}
