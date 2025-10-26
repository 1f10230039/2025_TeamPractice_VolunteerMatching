"use client";

/**
 * サーバーコンポーネントから "event" データを受け取るコンポーネント
 * @param {{ event: object }} props - page.jsから渡される1件のイベントデータ
 */
export default function EventDetailPage({ event }) {
  if (!event) {
    return <div>読み込み中...</div>;
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* とりあえずイベント名だけ表示 */}
      <h1>{event.name}</h1>
      <p style={{ marginTop: "20px", fontSize: "1.2rem" }}>
        ここにイベント詳細ページを作ってください！
      </p>
    </div>
  );
}
