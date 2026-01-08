// マイリストページのコンテナ
import MyListContainer from "@/components/pages/MyListContainer.jsx";

// ロジックは全てクライアント側のコンポーネントに委譲する
export default function Page() {
  // コンテナを表示
  return <MyListContainer />;
}
