"use client";

// サーバーコンポーネントから "event" データを受け取る
export default function EventDetailPage({ event }) {
  // eventデータが渡ってきてるか確認（仮）
  if (!event) {
    return <div>読み込み中...</div>;
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* とりあえずイベント名だけ表示してみる */}
      <h1>{event.name}</h1>

      <p style={{ marginTop: "20px", fontSize: "1.2rem" }}>
        これからここにイベント詳細ページを作っていきます
      </p>

      {/* (テスト用) 1件のデータがちゃんと来てるか見てみる */}
      {/* <pre>{JSON.stringify(event, null, 2)}</pre> */}
    </div>
  );
}
