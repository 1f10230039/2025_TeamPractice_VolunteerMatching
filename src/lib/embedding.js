"use server";

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// OpenAIクライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * テキストからembeddingを生成する関数
 * @param {string} text - 埋め込みを生成するテキスト
 * @returns {Promise<number[]>} - embeddingベクトル
 */
export async function createEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error creating embedding:", error);
    throw error;
  }
}

/**
 * クエリに基づいて類似イベントを検索する関数（RAG: Retrieval）
 * eventsテーブルのembeddingカラムを使用してベクトル検索を実行
 * @param {string} query - 検索クエリ
 * @param {number} limit - 返す結果の最大数（デフォルト: 3）
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function findSimilarEvents(query, limit = 3) {
  try {
    // クエリからembeddingを生成
    const embedding = await createEmbedding(query);

    // eventsテーブルのembeddingカラムを直接使用してベクトル検索を実行
    // match_events RPC関数を使用（この関数はeventsテーブルを参照する必要があります）
    const matchThreshold = 0.7; // 類似度のしきい値（0-1の間）
    const { data, error } = await supabase.rpc("match_events", {
      query_embedding: embedding,
      match_threshold: matchThreshold,
      match_count: limit,
    });

    if (error) {
      console.error("Error in findSimilarEvents:", error);
      // RPC関数が存在しない、またはeventsテーブルを参照していない場合のエラー
      console.error("match_events RPC関数がeventsテーブルを参照していることを確認してください");
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in findSimilarEvents:", error);
    return { data: null, error };
  }
}

