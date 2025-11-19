"use server";

import OpenAI from "openai";

// OpenAIクライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
});

/**
 * チャット完了を取得する関数
 * @param {Array} messages - メッセージの配列
 * @returns {Promise<string>} - AIの応答テキスト
 */
export async function getChatCompletion(messages) {
  try {
    // OpenAI APIに送信する前に、カスタムフィールド（eventData, events, options）を除外
    const sanitizedMessages = messages.map(({ eventData, events, options, ...rest }) => rest);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: sanitizedMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error in getChatCompletion:", error);
    throw error;
  }
}

const systemPrompt = `あなたは大学生向けのボランティアイベントを提案するAIアシスタントです。
以下の役割を持ちます：
1. ユーザーの興味や要望に基づいて適切なボランティアイベントを提案
2. 就活に関する相談への対応
3. 就活の方向性に合わせたボランティア活動の提案

提案する際は以下の形式で返答してください：
- ボランティアイベントの提案理由
- イベントの詳細（名前、日時、場所、内容）
- 就活やキャリアにどう活かせるか

応答は親しみやすく、かつ専門的なアドバイスができる口調を維持してください。`;

/**
 * 初期メッセージを作成する関数
 * @returns {Promise<Array>} - 初期メッセージの配列
 */
export async function createInitialMessages() {
  return [
    { role: "system", content: systemPrompt },
    {
      role: "assistant",
      content:
        "こんにちは！ボランティアイベントの検索や就活相談のお手伝いをさせていただきます。どのようなボランティアや活動に興味がありますか？",
      options: [
        "教育・子どもに関わるボランティア",
        "環境・社会問題に関わるボランティア",
        "就活に活かせるボランティアを探している",
        "その他のボランティアを探している"
      ],
    },
  ];
}

