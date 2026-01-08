// プロフィール編集ページのコンテナ
import ProfileEditContainer from "@/components/pages/ProfileEditContainer";

// ロジックは全てクライアント側のコンポーネントに委譲する
export default function Page() {
  // コンテナを表示
  return <ProfileEditContainer />;
}
