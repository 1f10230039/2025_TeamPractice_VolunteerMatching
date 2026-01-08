// 活動記録フォームコンポーネント
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styled from "@emotion/styled";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { FiSave, FiX, FiTrash2, FiSend } from "react-icons/fi";

// --- Emotion Styles ---
// ページ全体のラッパー
const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: #f5fafc;
  padding-bottom: 40px;
  font-family: "Helvetica Neue", Arial, sans-serif;
`;

// パンくずリストを固定するためのラッパー
const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #f5fafc;
`;

// コンテンツコンテナ
const ContentContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;

  @media (max-width: 600px) {
    margin-bottom: 100px;
    padding: 0 10px;
  }
`;

// ページタイトル
const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 800;
  margin: 20px 0 32px 0;
  color: #333;
  text-align: center;
`;

// フォーム全体
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
  background-color: #fff;
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(122, 211, 232, 0.15); /* ふんわり青い影 */

  @media (max-width: 600px) {
    padding: 20px;
  }
`;

// 各フォームグループ（ラベル＋入力欄）
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// ラベルスタイル
const Label = styled.label`
  font-weight: 600;
  color: #555;
  font-size: 0.95rem;

  &.required::after {
    content: " *";
    color: #e74c3c;
    margin-left: 4px;
  }
`;

// 入力欄スタイル
const Input = styled.input`
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

// テキストエリアスタイル
const Textarea = styled.textarea`
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  min-height: 120px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

// スマホ対応グリッド（PCは2列、スマホは1列）
const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

// ボタンエリア全体
const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  flex-wrap: wrap-reverse;
  gap: 20px;

  @media (max-width: 600px) {
    flex-direction: column-reverse;
    width: 100%;
  }
`;

// アクショングループ（キャンセル＋送信ボタン）
const ActionGroup = styled.div`
  display: flex;
  gap: 16px;
  flex: 1;
  justify-content: flex-end;

  @media (max-width: 600px) {
    width: 100%;
    gap: 12px;
  }
`;

// 共通ボタンスタイル（ベース）
const BaseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  svg {
    font-size: 1.2em;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// メインボタン（更新/作成）
const SubmitButton = styled(BaseButton)`
  background: linear-gradient(135deg, #68b5d5 0%, #4a90e2 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 10px rgba(74, 144, 226, 0.3);
  flex: 2;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(74, 144, 226, 0.4);
  }
`;

// キャンセルボタン
const CancelButton = styled(BaseButton)`
  background-color: transparent;
  color: #666;
  border: 2px solid #eee;
  flex: 1;

  &:hover {
    background-color: #f5f5f5;
    color: #333;
    border-color: #ddd;
  }
`;

// 削除ボタン
const DeleteButton = styled(BaseButton)`
  background-color: #fff0f0;
  color: #e74c3c;
  border: none;
  padding: 12px 20px;

  &:hover {
    background-color: #ffecec;
    color: #c0392b;
  }

  @media (max-width: 600px) {
    width: 100%;
    margin-top: 10px;
    background-color: transparent;
    border: 1px dashed #ffcccc;
  }
`;

// --- Component 本体 ---
// ActivityLogForm コンポーネント
export default function ActivityLogForm({ logToEdit }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 編集モードかどうか
  const isEditMode = Boolean(logToEdit);

  // フォームの各入力値の状態管理
  const [formData, setFormData] = useState({
    name: logToEdit?.name || "",
    datetime: logToEdit?.datetime ? logToEdit.datetime.split("T")[0] : "",
    reason: logToEdit?.reason || "",
    numbers: logToEdit?.numbers || "",
    content: logToEdit?.content || "",
    learning: logToEdit?.learning || "",
    reflection: logToEdit?.reflection || "",
  });

  // 入力変更ハンドラー
  const handleChange = e => {
    // 入力値を状態に反映
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // フォーム送信ハンドラー
  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    // もし必須項目が未入力ならアラートを出して終了
    if (!formData.name || !formData.datetime) {
      alert("活動名と活動日は必須です。");
      setIsLoading(false);
      return;
    }

    // ユーザー情報取得
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // もしログインしていなければアラートを出して終了
    if (!user) {
      alert("ログインしてください");
      setIsLoading(false);
      return;
    }

    // 提出データの整形
    const submissionData = {
      ...formData,
      user_id: user.id,
      datetime: new Date(formData.datetime).toISOString(),
      numbers:
        formData.numbers && !isNaN(parseInt(formData.numbers))
          ? parseInt(formData.numbers, 10)
          : null,
      // activity_scale は送らない
    };

    // 保存処理（新規作成 or 更新）
    try {
      // もし編集モードなら更新、そうでなければ新規作成
      if (isEditMode) {
        // --- 更新 ---
        // IDを指定して更新
        const { error } = await supabase
          .from("activity_log") // 活動ログテーブル
          .update(submissionData) // 更新データ
          .eq("id", logToEdit.id); // 対象のログIDを指定

        //　もしエラーが発生したらキャッチに飛ばす
        if (error) throw error;
        alert("活動記録を更新しました！");
        router.push(`/activity-log/${logToEdit.id}`);
        router.refresh();
        // それ以外は新規作成
      } else {
        // --- 新規作成 ---
        // データを挿入して、挿入後のデータを取得
        const { data, error } = await supabase
          .from("activity_log") // 活動ログテーブル
          .insert([submissionData]) // 挿入データ（配列で渡す）
          .select() // 挿入後のデータを取得
          .single(); // single()で1件だけ取得

        //　もしエラーが発生したらキャッチに飛ばす
        if (error) throw error;
        alert("活動記録を作成しました！");
        // もし挿入後のデータが存在すればそのIDへ遷移、なければ一覧へ遷移
        if (data && data.id) {
          router.push(`/activity-log/${data.id}`);
          // 詳細ページへ遷移した後に一覧を更新
        } else {
          router.push("/activity-log");
        }
      }
      router.refresh();
      // 正常終了
      //  もしエラーが発生したらキャッチに飛ばす
    } catch (error) {
      console.error("保存エラー:", error.message);
      alert("エラーが発生しました。");
      // 最後にローディング解除
    } finally {
      setIsLoading(false);
    }
  };

  // 削除ハンドラー
  const handleDelete = async () => {
    // もし編集モードでなければ何もしない
    if (!isEditMode) return;
    // 本当に削除するか確認
    if (!confirm("本当に削除しますか？\nこの操作は元に戻せません。")) return;

    // 削除処理
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("activity_log") // 活動ログテーブル
        .delete() // 削除操作
        .eq("id", logToEdit.id); // 対象のログIDを指定

      // もしエラーが発生したらキャッチに飛ばす
      if (error) throw error;
      // 正常終了
      alert("活動記録を削除しました。");
      router.push("/activity-log");
      router.refresh();
      //  もしエラーが発生したらキャッチに飛ばす
    } catch (error) {
      console.error("削除エラー:", error.message);
      alert("エラーが発生しました。");
      // 最後にローディング解除
    } finally {
      setIsDeleting(false);
    }
  };

  // パンくずリスト
  const crumbs = [
    { label: "活動の記録", href: "/activity-log" }, // 活動ログ一覧ページへ
    { label: isEditMode ? "活動記録を編集" : "活動記録を新規作成", href: "#" }, // 今回のページ
  ];
  const baseCrumb = { label: "マイページ", href: "/mypage" }; // マイページへ

  // --- コンポーネント描画 ---
  return (
    <PageWrapper>
      <StickyHeader>
        <Breadcrumbs crumbs={crumbs} baseCrumb={baseCrumb} />
      </StickyHeader>

      <ContentContainer>
        <PageTitle>
          {isEditMode ? "活動記録を編集" : "活動記録を新規作成"}
        </PageTitle>

        <Form onSubmit={handleSubmit}>
          {/* 活動名 */}
          <FormGroup>
            <Label className="required" htmlFor="name">
              活動名
            </Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="例：令和〇年能登半島地震　災害ボランティア"
            />
          </FormGroup>

          {/* 活動日・参加人数 */}
          <GridWrapper>
            <FormGroup>
              <Label className="required" htmlFor="datetime">
                活動日
              </Label>
              <Input
                type="date"
                id="datetime"
                name="datetime"
                value={formData.datetime}
                onChange={handleChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="numbers">参加人数 (人)</Label>
              <Input
                type="number"
                id="numbers"
                name="numbers"
                value={formData.numbers}
                onChange={handleChange}
                placeholder="例：300"
              />
            </FormGroup>
          </GridWrapper>

          {/* 参加した理由・目的 */}
          <FormGroup>
            <Label htmlFor="reason">参加した理由・目的</Label>
            <Textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="例：報道で見るだけでなく、実際に自分の目で現地の状況を確かめ、何かできることをしたかったから。"
            />
          </FormGroup>

          {/* 活動内容 */}
          <FormGroup>
            <Label htmlFor="content">活動内容</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="例：石川県輪島市にて、被災家屋からの家財道具の運び出しと、災害ゴミの分別作業に従事した。"
            />
          </FormGroup>

          {/* 活動による学び */}
          <FormGroup>
            <Label htmlFor="learning">活動による学び</Label>
            <Textarea
              id="learning"
              name="learning"
              value={formData.learning}
              onChange={handleChange}
              placeholder="例：チームで声を掛け合い、安全と効率を両立させながら作業する重要性を学んだ。"
            />
          </FormGroup>

          {/* 活動の感想・反省 */}
          <FormGroup>
            <Label htmlFor="reflection">活動の感想・反省</Label>
            <Textarea
              id="reflection"
              name="reflection"
              value={formData.reflection}
              onChange={handleChange}
              placeholder="例：現地の方に直接「ありがとう」と言われ、無力ではないと実感できた。"
            />
          </FormGroup>

          {/* ボタンエリア */}
          <ButtonContainer>
            {isEditMode && (
              <DeleteButton
                type="button"
                onClick={handleDelete}
                disabled={isLoading || isDeleting}
              >
                <FiTrash2 />
                <span>削除</span>
              </DeleteButton>
            )}

            <ActionGroup>
              <CancelButton
                type="button"
                onClick={() => router.push("/activity-log")}
              >
                <FiX />
                <span>キャンセル</span>
              </CancelButton>

              <SubmitButton type="submit" disabled={isLoading || isDeleting}>
                {isEditMode ? <FiSave /> : <FiSend />}
                <span>
                  {isLoading
                    ? "保存中..."
                    : isEditMode
                      ? "更新する"
                      : "作成する"}
                </span>
              </SubmitButton>
            </ActionGroup>
          </ButtonContainer>
        </Form>
      </ContentContainer>
    </PageWrapper>
  );
}
