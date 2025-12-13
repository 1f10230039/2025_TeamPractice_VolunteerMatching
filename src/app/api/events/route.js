// src/app/api/events/route.js

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";
import OpenAI from "openai";

// OpenAIの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * テキストからembeddingを生成する関数
 * @param {string} text
 * @returns {Promise<number[]>}
 */
async function createEmbedding(text) {
  if (!text) return null;
  const formattedText = text.replace(/\\n/g, " ");
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: formattedText,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error creating embedding:", error);
    // エラーが発生しても処理を続行するためにnullを返す
    return null;
  }
}

export async function POST(request) {
  const body = await request.json();
  const { eventData, selectedTagIds } = body;
  const supabase = await createSupabaseServerClient();

  // 編集モードかどうかを判定
  const isEditMode = Boolean(eventData.id);

  try {
    let targetEventId = null;
    let upsertedEvent = null;

    // 1. イベントデータの登録 or 更新
    if (isEditMode) {
      // --- 更新 (UPDATE) ---
      const { data, error } = await supabase
        .from("events")
        .update(eventData)
        .eq("id", eventData.id)
        .select()
        .single();
      if (error) throw error;
      upsertedEvent = data;
      targetEventId = data.id;
    } else {
      // --- 新規作成 (INSERT) ---
      const { data, error } = await supabase
        .from("events")
        .insert([eventData])
        .select()
        .single();
      if (error) throw error;
      upsertedEvent = data;
      targetEventId = data.id;
    }

    // 2. タグの紐付け処理
    if (targetEventId) {
      // 既存のタグ紐付けをリセット
      await supabase.from("event_tags").delete().eq("event_id", targetEventId);

      // 新しいタグを紐付け
      if (selectedTagIds && selectedTagIds.length > 0) {
        const tagInsertData = selectedTagIds.map(tagId => ({
          event_id: targetEventId,
          tag_id: tagId,
        }));
        const { error: insertTagsError } = await supabase
          .from("event_tags")
          .insert(tagInsertData);
        if (insertTagsError) throw insertTagsError;
      }
    }

    // 3. ベクトル化 (Embedding) & 保存
    if (upsertedEvent) {
      const inputText = `
        イベント名: ${upsertedEvent.name || ""}
        概要: ${upsertedEvent.short_description || ""}
        詳細: ${upsertedEvent.long_description || ""}
        アピールポイント: ${upsertedEvent.appeal || ""}
        得られる経験: ${upsertedEvent.experience || ""}
      `.trim();

      const embedding = await createEmbedding(inputText);

      if (embedding) {
        await supabase
          .from("events")
          .update({ embedding: embedding })
          .eq("id", upsertedEvent.id);
      }
    }

    return NextResponse.json({
      message: isEditMode ? "イベントを更新しました" : "イベントを作成しました",
      eventId: targetEventId,
    });
  } catch (error) {
    console.error("Event processing error:", error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
