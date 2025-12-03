"use server";

import { createClient } from '@supabase/supabase-js';
import { getChatCompletion, createInitialMessages as getInitialMessagesOpenAI } from '@/lib/openai';
import { findSimilarEvents } from '@/lib/embedding';
import AIChatPage from "@/components/pages/AIChatPage";

// Supabaseクライアントの初期化
// Server Actionはサーバー環境でのみ実行されるため、サービスロールキーを安全に使用できる
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

/**
 * 初期メッセージを取得するServer Action
 * @returns {Promise<Array>} 初期メッセージの配列
 */
export async function getInitialMessages() {
  try {
    return await getInitialMessagesOpenAI();
  } catch (error) {
    console.error('Error in getInitialMessages Server Action:', error);
    // エラーが発生した場合、クライアント側で処理できるようにnullを返すか、エラーをスローする
    // ここではUIの崩れを防ぐため、空の配列を返す
    return [];
  }
}

/**
 * チャットメッセージを処理するServer Action（RAG実装）
 * @param {Array} messages - これまでの会話のメッセージ配列
 * @returns {Object} - AIの応答メッセージオブジェクト
 */
export async function processChatMessage(messages) {
  try {
    // ユーザーの最新メッセージを取得
    const userMessage = messages.filter(msg => msg.role === 'user').pop();
    if (!userMessage) {
      throw new Error('User message not found');
    }

    // RAG: Retrieval - セマンティック検索でイベントを検索
    const { data: events, error: searchError } = await findSimilarEvents(
      userMessage.content,
      3
    );

    if (searchError) {
      console.error('Error in findSimilarEvents:', searchError);
    }

    // 検索結果のIDを使って完全なイベント情報を取得
    let fullEvents = [];
    if (events && events.length > 0) {
      const eventIds = events.map(e => e.id);
      const { data: fullEventsData, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .in('id', eventIds);

      if (!fetchError && fullEventsData) {
        fullEvents = events.map(searchResult => 
          fullEventsData.find(e => e.id === searchResult.id) || searchResult
        );
      } else {
        fullEvents = events;
      }
    }

    // コンテキストの整形
    const context = 
      fullEvents && fullEvents.length > 0
        ? fullEvents
            .map(
              event => `
イベント名: ${event.name}
場所: ${event.place || '場所未定'}
日時: ${event.start_datetime ? new Date(event.start_datetime).toLocaleDateString('ja-JP') : '日時未定'}
説明: ${event.short_description || ''}
`
            )
            .join('\n\n')
        : '関連するイベントは見つかりませんでした。';

    // システムメッセージの作成
    const systemMessage = {
      role: 'system',
      content: `あなたは大学生のためのボランティアイベントアドバイザーです。
提供されたイベント情報を基に、ユーザーの質問に最も適したイベントを提案してください。
イベントを提案する際は、なぜそのイベントが適しているのか、具体的な情報（日時、場所など）を交えて説明してください。
検索結果でイベントが見つからなかった場合でも、ユーザーの意図を汲み取り、一般的なアドバイスや代わりの提案をしてください。
回答にはMarkdownを使用して、情報を整理し、読みやすくしてください。例えば、太字、リスト、斜体などを使用して、重要な点を強調することができます。
ユーザーが次のアクションを取りやすいように、回答の最後に4つの選択肢を提示することがあります。その場合は、必ず以下のJSON形式で応答の末尾に含めてください：
{"options": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"]}`,
    };
    
    const contextMessage = {
      role: 'system',
      content: `【検索結果】\n${context}`
    }

    // メッセージ履歴と新しいシステムメッセージを結合
    const messagesWithoutSystem = messages.filter(msg => msg.role !== 'system');
    const messagesWithContext = [systemMessage, contextMessage, ...messagesWithoutSystem];

    // RAG: Augmented Generation - AIからの応答を取得
    const aiResponseText = await getChatCompletion(messagesWithContext);

    // 応答から選択肢を抽出
    let options = null;
    let content = aiResponseText;
    const jsonMatch = aiResponseText.match(/\{"options":\s*\[.*?\]\}/s);
    if (jsonMatch) {
      try {
        options = JSON.parse(jsonMatch[0]).options;
        content = aiResponseText.replace(jsonMatch[0], '').trim();
      } catch (e) {
        console.error('Failed to parse options JSON:', e);
      }
    }

    // 応答メッセージオブジェクトを作成
    return {
      role: 'assistant',
      content: content,
      events: fullEvents.length > 0 ? fullEvents : null,
      options: options,
    };

  } catch (error) {
    console.error('Error in processChatMessage Server Action:', error);
    // クライアントにエラー情報を返す
    return {
      role: 'assistant',
      content: '申し訳ありません、エラーが発生しました。もう一度お試しください。',
      error: true,
    };
  }
}

// ページコンポーネント（デフォルトエクスポート）
// 注意: "use server" があるため、このファイルはServer Component専用になります
// Reactコンポーネントは別ファイル（AIChatPage.jsx）に分離されています
export default async function Page() {
  return <AIChatPage />;
}
