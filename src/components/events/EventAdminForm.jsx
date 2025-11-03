// ボランティア登録・編集フォームコンポーネント

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styled from "@emotion/styled";
import Image from "next/image";
import { useDropzone } from "react-dropzone";

// --- Emotionでスタイル定義 ---
// フォーム全体のコンテナ
const FormContainer = styled.form`
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
`;

// ページタイトル
const PageTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 24px;
`;

// 各入力項目のラッパー
const FormGroup = styled.div`
  margin-bottom: 20px;
`;

// 入力項目のラベル
const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 1rem;
`;

// 1行の入力欄 (input)
const Input = styled.input`
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
`;

// 複数行の入力欄 (textarea)
const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
  min-height: 120px;
  font-family: inherit;
`;

// チェックボックス用ラッパーと入力欄
const CheckboxWrapper = styled.label`
  display: flex;
  align-items: center;
  font-weight: 500;
  gap: 10px;
  cursor: pointer;
`;

// チェックボックス入力欄
const CheckboxInput = styled.input`
  width: 18px;
  height: 18px;
`;

// 緯度・経度など、横に2つ並べるためのラッパー
const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

// 保存ボタン
const SubmitButton = styled.button`
  padding: 12px 24px;
  font-size: 1.1rem;
  font-weight: bold;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

// 画像プレビューエリア
const DropzoneContainer = styled.div`
  width: 100%;
  height: 250px;
  border-radius: 8px;
  border: 2px dashed ${props => (props.isDragActive ? "#007bff" : "#ccc")};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: ${props => (props.isDragActive ? "#f0f8ff" : "#f9f9f9")};
  color: #888;
  position: relative;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
`;

/**
 * SupabaseのISO文字列 (UTC) を <input type="datetime-local"> 用の
 * "YYYY-MM-DDTHH:MM" 形式 (JST) に変換する
 */
const formatDatetimeLocal = isoString => {
  if (!isoString) {
    return "";
  }

  try {
    const date = new Date(isoString);
    // 日付が無効（Invalid Date）なら空文字を返す
    if (isNaN(date.getTime())) {
      return "";
    }

    // JSTに補正 (UTCとの時差9時間 = 9 * 60 * 60 * 1000 ms)
    const jstOffset = 9 * 60 * 60 * 1000;
    const jstDate = new Date(date.getTime() + jstOffset);

    // YYYY-MM-DDTHH:MMの形に整形
    return jstDate.toISOString().slice(0, 16);
  } catch (e) {
    return ""; // エラーが起きても空文字を返す
  }
};

// propsでeventToEditを受け取る（新規作成の時はundefinedになる）
export default function EventAdminForm({ eventToEdit }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // フォームのモードを判別
  const isEditMode = Boolean(eventToEdit);

  // 画像アップロード用の状態管理
  const [uploadFile, setUploadFile] = useState(null);

  // フォームの各入力値の状態管理 (カラム全部)
  const [formData, setFormData] = useState({
    name: eventToEdit?.name || "",
    tag: eventToEdit?.tag || "",
    place: eventToEdit?.place || "",
    fee: eventToEdit?.fee || 0,
    start_datetime: formatDatetimeLocal(eventToEdit?.start_datetime) ?? "",
    end_datetime: formatDatetimeLocal(eventToEdit?.end_datetime) ?? "",
    image_url: eventToEdit?.image_url ?? "",
    favorite: eventToEdit?.favorite || false,
    short_description: eventToEdit?.short_description || "",
    long_description: eventToEdit?.long_description || "",
    website_url: eventToEdit?.website_url || "",
    capacity: eventToEdit?.capacity || 0,
    organaizer: eventToEdit?.organaizer || "",
    latitude: eventToEdit?.latitude || "",
    longitude: eventToEdit?.longitude || "",
    belongings: eventToEdit?.belongings || "",
    clothing: eventToEdit?.clothing || "",
    selection_flow: eventToEdit?.selection_flow || "",
    access: eventToEdit?.access || "",
    applied: eventToEdit?.applied || false,
    city: eventToEdit?.city || "",
    prefecture: eventToEdit?.prefectures || "",
  });

  // Dropzoneの設定
  const onDrop = useCallback(acceptedFiles => {
    // 1枚だけファイルを受け取る
    if (acceptedFiles && acceptedFiles[0]) {
      const file = acceptedFiles[0];
      setUploadFile(file); // ファイル自体をuploadFile state に保存

      // プレビュー用に、formData の image_url を一時的に書き換える
      setFormData(prev => ({
        ...prev,
        // DropzoneでプレビューURLが残っちゃうのを防ぐために、前のプレビューURLを一旦消してから新しいのを作る
        image_url: URL.createObjectURL(file),
      }));
    }
  }, []); // useCallbackで関数をメモ化

  // ファイル選択が変わった時のハンドラ（Dropzoneを使わない場合用）
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      // 受け入れるファイルタイプ
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    multiple: false, // 1ファイルだけ
  });

  // 入力欄が変わった時の汎用ハンドラ
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // チェックボックス専用ハンドラ
  const handleCheckboxChange = e => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  // フォームが送信された時の処理
  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    // 入力必須項目のチェック
    if (!formData.name || !formData.start_datetime || !formData.end_datetime) {
      alert("イベント名と開始/終了日時は必須です。");
      setIsLoading(false);
      return;
    }

    // Supabaseに送るデータ（日付をISO形式に直す）
    let submissionData = {
      ...formData,
      // datetime-localの値をDateオブジェクトにしてからISO文字列(UTC)に変換
      start_datetime: new Date(formData.start_datetime).toISOString(),
      end_datetime: new Date(formData.end_datetime).toISOString(),
      // 文字列で来ちゃうfeeとcapacityを数値に変換
      fee: parseInt(formData.fee, 10) || 0,
      capacity: parseInt(formData.capacity, 10) || 0,
      // 緯度経度を浮動小数点数に変換 (空なら null)
      latitude: parseFloat(formData.latitude) || null,
      longitude: parseFloat(formData.longitude) || null,
      prefectures: formData.prefecture, // カラム名に合わせる
    };

    // prefectureキーを削除（prefecturesを使ったため）
    delete submissionData.prefecture;

    let finalImageUrl = formData.image_url;

    try {
      if (uploadFile) {
        console.log("新しい画像をアップロードします...");

        // ファイル名を一意にする (例: public/17123456789.png)
        const fileExt = uploadFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`; // Supabase Storage のパス

        // Supabase Storage にアップロード
        const { error: uploadError } = await supabase.storage
          .from("events-images") // バケツ名
          .upload(filePath, uploadFile); // パスとファイル

        if (uploadError) {
          throw new Error(`画像アップロード失敗: ${uploadError.message}`);
        }

        // アップロードしたファイルの「公開URL」を取得
        const { data: urlData } = supabase.storage
          .from("events-images")
          .getPublicUrl(filePath);

        if (!urlData || !urlData.publicUrl) {
          throw new Error("画像の公開URL取得に失敗しました。");
        }

        finalImageUrl = urlData.publicUrl; // これがDBに保存するURL
        console.log("アップロード成功！ URL:", finalImageUrl);
      }

      submissionData = {
        ...submissionData,
        image_url: finalImageUrl, // 最終的なURLをセット
        start_datetime: new Date(formData.start_datetime).toISOString(),
        end_datetime: new Date(formData.end_datetime).toISOString(),
      };

      if (isEditMode) {
        // --- 「編集モード」の処理 ---
        const { error } = await supabase
          .from("events")
          .update(submissionData)
          .eq("id", eventToEdit.id);

        if (error) throw error;
        alert("イベントを更新しました！");
        // 成功したら、一般公開用の「詳細ページ」に飛ぶ
        router.push(`/events/${eventToEdit.id}`);
      } else {
        // --- 「新規作成モード」の処理 ---
        const { data, error } = await supabase
          .from("events")
          .insert([submissionData])
          .select()
          .single();

        if (error) throw error;
        alert("イベントを作成しました！");
        // 成功したら、今作ったイベントの「詳細ページ」に飛ぶ
        if (data && data.id) {
          router.push(`/events/${data.id}`);
        } else {
          router.push("/admin/events");
        }
      }

      // サーバーコンポーネントのキャッシュを更新させる
      router.refresh();
    } catch (error) {
      console.error("イベントの保存に失敗:", error.message);
      alert(`エラーが発生しました: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <PageTitle>
        {isEditMode ? "ボランティアを編集" : "ボランティアを新規登録"}
      </PageTitle>

      {/* --- 基本情報 --- */}
      <FormGroup>
        <Label htmlFor="name">イベント名 (必須)</Label>
        <Input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </FormGroup>

      <GridWrapper>
        <FormGroup>
          <Label htmlFor="start_datetime">開始日時 (必須)</Label>
          <Input
            type="datetime-local"
            id="start_datetime"
            name="start_datetime"
            value={formData.start_datetime}
            onChange={handleChange}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="end_datetime">終了日時 (必須)</Label>
          <Input
            type="datetime-local"
            id="end_datetime"
            name="end_datetime"
            value={formData.end_datetime}
            onChange={handleChange}
            required
          />
        </FormGroup>
      </GridWrapper>

      {/* --- 場所・費用 --- */}
      <GridWrapper>
        <FormGroup>
          <Label htmlFor="place">開催場所</Label>
          <Input
            type="text"
            id="place"
            name="place"
            value={formData.place}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="fee">費用 (必須, 無料なら0)</Label>
          <Input
            type="number"
            id="fee"
            name="fee"
            value={formData.fee}
            onChange={handleChange}
            required
          />
        </FormGroup>
      </GridWrapper>

      <GridWrapper>
        <FormGroup>
          <Label htmlFor="prefecture">都道府県</Label>
          <Input
            type="text"
            id="prefecture"
            name="prefecture"
            value={formData.prefecture}
            onChange={handleChange}
            placeholder="例: 千葉県"
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="city">市町村</Label>
          <Input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="例: 松戸市"
          />
        </FormGroup>
      </GridWrapper>

      <FormGroup>
        <Label htmlFor="access">アクセス</Label>
        <Textarea
          id="access"
          name="access"
          value={formData.access}
          onChange={handleChange}
          placeholder="例: ○○駅 徒歩5分"
        />
      </FormGroup>

      {/* --- 緯度・経度 --- */}
      <GridWrapper>
        <FormGroup>
          <Label htmlFor="latitude">緯度 (Latitude)</Label>
          <Input
            type="number"
            step="any"
            id="latitude"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="例: 35.787"
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="longitude">経度 (Longitude)</Label>
          <Input
            type="number"
            step="any"
            id="longitude"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="例: 139.913"
          />
        </FormGroup>
      </GridWrapper>

      {/* --- 詳細情報 --- */}
      <FormGroup>
        <Label htmlFor="short_description">短い紹介文 (一覧用)</Label>
        <Textarea
          id="short_description"
          name="short_description"
          value={formData.short_description}
          onChange={handleChange}
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="long_description">長い紹介文 (詳細用)</Label>
        <Textarea
          id="long_description"
          name="long_description"
          value={formData.long_description}
          onChange={handleChange}
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="image_upload">アイキャッチ画像</Label>

        {/* Dropzoneエリア */}
        <DropzoneContainer {...getRootProps()} isDragActive={isDragActive}>
          {/* Dropzone が必要とする <input> (見えない) */}
          <input {...getInputProps()} id="image_upload" name="image_upload" />

          {formData.image_url ? (
            // プレビュー画像がある場合
            <Image
              src={formData.image_url}
              alt="画像プレビュー"
              layout="fill"
              objectFit="cover"
              // 古いプレビューURLが残ってた場合、無効になったら消す
              onError={() => {
                setFormData(prev => ({ ...prev, image_url: "" }));
              }}
            />
          ) : // 画像がない場合（ドラッグ中か、通常か）
          isDragActive ? (
            <p>ここにファイルをドロップ！</p>
          ) : (
            <p>
              ファイルをドラッグ＆ドロップ、
              <br />
              またはクリックしてファイルを選択
            </p>
          )}
        </DropzoneContainer>

        <small style={{ color: "#555", marginTop: "10px", display: "block" }}>
          （編集モードの場合）新しい画像を選択すると、既存の画像が上書きされます。
        </small>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="website_url">公式サイトURL</Label>
        <Input
          type="url"
          id="website_url"
          name="website_url"
          value={formData.website_url}
          onChange={handleChange}
          placeholder="https://..."
        />
      </FormGroup>

      {/* --- 募集要項 --- */}
      <GridWrapper>
        <FormGroup>
          <Label htmlFor="capacity">定員 (数字)</Label>
          <Input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="organaizer">主催者</Label>
          <Input
            type="text"
            id="organaizer"
            name="organaizer"
            value={formData.organaizer}
            onChange={handleChange}
          />
        </FormGroup>
      </GridWrapper>

      <FormGroup>
        <Label htmlFor="belongings">持ち物</Label>
        <Input
          type="text"
          id="belongings"
          name="belongings"
          value={formData.belongings}
          onChange={handleChange}
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="clothing">服装</Label>
        <Input
          type="text"
          id="clothing"
          name="clothing"
          value={formData.clothing}
          onChange={handleChange}
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="selection_flow">選考フロー</Label>
        <Textarea
          id="selection_flow"
          name="selection_flow"
          value={formData.selection_flow}
          onChange={handleChange}
        />
      </FormGroup>

      {/* --- その他フラグ --- */}
      <GridWrapper>
        <FormGroup>
          <CheckboxWrapper>
            <CheckboxInput
              type="checkbox"
              id="favorite"
              name="favorite"
              checked={formData.favorite}
              onChange={handleCheckboxChange}
            />
            お気に入り (デモ用)
          </CheckboxWrapper>
        </FormGroup>
        <FormGroup>
          <CheckboxWrapper>
            <CheckboxInput
              type="checkbox"
              id="applied"
              name="applied"
              checked={formData.applied}
              onChange={handleCheckboxChange}
            />
            応募済み (デモ用)
          </CheckboxWrapper>
        </FormGroup>
      </GridWrapper>

      {/* --- タグ --- */}
      <FormGroup>
        <Label htmlFor="tag">タグ</Label>
        <Input
          type="text"
          id="tag"
          name="tag"
          value={formData.tag}
          onChange={handleChange}
          placeholder="例: 子供向け, 屋外"
        />
      </FormGroup>

      {/* --- 保存ボタン --- */}
      <SubmitButton type="submit" disabled={isLoading}>
        {isLoading ? "保存中..." : isEditMode ? "更新する" : "登録する"}
      </SubmitButton>
    </FormContainer>
  );
}
