// src/app/mylist/page.js

import MyListContainer from "@/components/pages/MyListContainer.jsx";

export default function Page() {
  // サーバー側での処理は一切なし。
  // すべて MyListContainer (クライアント) に任せる。
  return <MyListContainer />;
}
