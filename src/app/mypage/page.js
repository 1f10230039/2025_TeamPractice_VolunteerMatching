// マイページのコンテナ
import MyPage from "@/components/pages/MyPage.jsx";

// ロジックは全てクライアント側のコンポーネントに委譲する
export default function MyPageContainer() {
  // コンテナを表示
  return <MyPage />;
}
