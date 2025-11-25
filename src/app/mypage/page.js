// src/app/mypage/page.js

// サーバー側でのチェックを廃止したので、これだけでOKです
import MyPage from "@/components/pages/MyPage.jsx";

export default function MyPageContainer() {
  // サーバーでは何もせず、ただクライアントコンポーネントを表示するだけ
  // 認証チェックやデータ取得は、すべて MyPage.jsx の中で行います
  return <MyPage />;
}
