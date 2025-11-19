// scripts/generate_embeddings.js
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

// 環境変数からキーを読み込む
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
  console.error('必要な環境変数（SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY）が.env.localに設定されていません。');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

/**
 * テキストからembeddingを生成する関数
 */
async function createEmbedding(text) {
  const formattedText = text.replace(/\\n/g, ' ');
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: formattedText,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    throw error;
  }
}

/**
 * 全イベントのembeddingを生成・更新するメイン関数
 */
async function generateEmbeddingsForAllEvents() {
  console.log('Supabaseからすべてのイベントを取得し、embeddingを更新します...');

  // すべてのイベントを取得
  const { data: events, error } = await supabase
    .from('events')
    .select('id, name, short_description, long_description, appeal, experience');

  if (error) {
    console.error('イベントの取得に失敗しました:', error);
    return;
  }

  if (!events || events.length === 0) {
    console.log('処理対象のイベントはありませんでした。');
    return;
  }

  console.log(`${events.length}件のイベントのembeddingを生成します...`);

  for (const event of events) {
    console.log(`処理中: ${event.name} (ID: ${event.id})`);

    // embeddingの元となるテキストを結合（どの情報を重視するかで調整）
    const inputText = `
      イベント名: ${event.name || ''}
      概要: ${event.short_description || ''}
      詳細: ${event.long_description || ''}
      アピールポイント: ${event.appeal || ''}
      得られる経験: ${event.experience || ''}
    ` .trim();

    if (!inputText.replace(/イベント名:|概要:|詳細:|アピールポイント:|得られる経験:/g, '').trim()) {
      console.warn(`  -> ID ${event.id} は内容が空のためスキップします。`);
      continue;
    }

    try {
      // embeddingを生成
      const embedding = await createEmbedding(inputText);

      // Supabaseのeventsテーブルを更新
      const { error: updateError } = await supabase
        .from('events')
        .update({ embedding: embedding })
        .eq('id', event.id);

      if (updateError) {
        console.error(`  -> ID ${event.id} の更新に失敗しました:`, updateError);
      } else {
        console.log(`  -> ID ${event.id} のembeddingを更新しました。`);
      }
    } catch (e) {
      console.error(`  -> ID ${event.id} の処理中にエラーが発生しました:`, e);
    }
  }

  console.log('すべての処理が完了しました。');
}

// スクリプトを実行
generateEmbeddingsForAllEvents();
