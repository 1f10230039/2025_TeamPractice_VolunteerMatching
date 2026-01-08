//　APIルート: チャットメッセージの処理（RAG実装）
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getChatCompletion, createInitialMessages } from "@/lib/openai";
import { findSimilarEvents } from "@/lib/embedding";

// Supabaseクライアントの初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * GET: 初期メッセージを取得
 */
export async function GET() {
  try {
    const initialMessages = await createInitialMessages();
    return NextResponse.json({ messages: initialMessages });
  } catch (error) {
    console.error("Error in GET /api/chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST: チャットメッセージを処理（RAG実装）
 */
export async function POST(request) {
  try {
    const { messages } = await request.json();

    // ユーザーの最新メッセージを取得
    const userMessage = messages.filter(msg => msg.role === "user").pop();
    if (!userMessage) {
      return NextResponse.json(
        { error: "User message not found" },
        { status: 400 }
      );
    }

    // RAG: Retrieval - セマンティック検索でイベントを検索
    const { data: events, error: searchError } = await findSimilarEvents(
      userMessage.content,
      3
    );

    if (searchError) {
      console.error("Error in findSimilarEvents:", searchError);
      // 検索エラーが発生してもAI応答は続行
    }

    // match_events関数は限られたカラムしか返さないため、
    // 検索結果のIDを使って完全なイベント情報を取得
    let fullEvents = [];
    if (events && events.length > 0) {
      const eventIds = events.map(e => e.id);
      const { data: fullEventsData, error: fetchError } = await supabase
        .from("events")
        .select("*")
        .in("id", eventIds);

      if (!fetchError && fullEventsData) {
        // 検索結果の順序を保持（similarity順）
        fullEvents = events.map(searchResult => {
          const fullEvent = fullEventsData.find(e => e.id === searchResult.id);
          return fullEvent || searchResult; // 見つからない場合は検索結果のみを使用
        });
      } else {
        // 取得に失敗した場合は検索結果のみを使用
        fullEvents = events;
      }
    }

    // 検索結果をコンテキストとして整形
    const context =
      fullEvents && fullEvents.length > 0
        ? fullEvents
            .map(
              event => `
イベント名: ${event.name}
場所: ${event.place || "場所未定"}
日時: ${event.start_datetime ? new Date(event.start_datetime).toLocaleDateString("ja-JP") : "日時未定"} ${event.end_datetime ? `～ ${new Date(event.end_datetime).toLocaleDateString("ja-JP")}` : ""}
説明: ${event.short_description || ""}
${event.long_description ? `詳細: ${event.long_description}` : ""}
参加費: ${event.fee ? `${event.fee}円` : "無料"}
定員: ${event.capacity ? `${event.capacity}名` : "設定なし"}
`
            )
            .join("\n\n")
        : "イベントは見つかりませんでした。";

    // AIへの指示とコンテキストを含めたシステムメッセージを作成
    const systemMessage = {
      role: "system",
      content: `あなたは大学生のためのボランティアイベントアドバイザーです。
以下の要件に従って回答してください：
1. 提供されたイベント情報を基に、ユーザーの質問や興味に最も適したイベントを提案してください。
2. イベントを提案する際は、なぜそのイベントが適しているのかを説明してください。
3. 就活に関する質問の場合は、キャリア形成の観点からアドバイスを提供し、関連するイベントがあれば提案してください。
4. 回答は親しみやすく、かつ専門的な視点を含めてください。
5. イベントの具体的な情報（日時、場所、費用など）は必ず含めてください。
6. ユーザーの要望が不明確な場合や、より詳しい情報が必要な場合は、質問と4つの選択肢を提示してください。
7. 選択肢を提示する場合は、応答の最後に以下のJSON形式で選択肢を含めてください：
   {"options": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"]}
   選択肢は具体的で、ユーザーが選びやすい内容にしてください。

現在の検索結果：
${context}`,
    };

    // 既存のメッセージからシステムメッセージを除外し、新しいシステムメッセージを先頭に追加
    const messagesWithoutSystem = messages.filter(msg => msg.role !== "system");
    const messagesWithContext = [systemMessage, ...messagesWithoutSystem];

    // RAG: Augmented Generation - AIからの応答を取得
    const aiResponse = await getChatCompletion(messagesWithContext);

    // 応答から選択肢を抽出（JSON形式で含まれている場合）
    let options = null;
    let content = aiResponse;

    // JSON形式の選択肢を抽出
    const jsonMatch = aiResponse.match(/\{"options":\s*\[.*?\]\}/s);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (
          parsed.options &&
          Array.isArray(parsed.options) &&
          parsed.options.length === 4
        ) {
          options = parsed.options;
          // JSON部分を応答から削除
          content = aiResponse.replace(/\{"options":\s*\[.*?\]\}/s, "").trim();
        }
      } catch (e) {
        console.error("Failed to parse options JSON:", e);
      }
    }

    // 検索結果のイベントをすべて含める（最大3件）
    // fullEventsを使用（完全な情報を含む）
    const relevantEvents =
      fullEvents && fullEvents.length > 0 ? fullEvents : null;

    // AIの応答とイベントデータ、選択肢を組み合わせる
    const responseMessage = {
      role: "assistant",
      content: content,
      events: relevantEvents, // 複数のイベントを配列で返す
      eventData: relevantEvents?.[0] || null, // 後方互換性のため最初のイベントも含める
      options: options,
    };

    return NextResponse.json({ message: responseMessage });
  } catch (error) {
    console.error("Error in POST /api/chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
