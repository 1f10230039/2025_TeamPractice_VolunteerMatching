// ボランティア登録・編集フォームコンポーネント

"use client";

import { useState, useCallback, useEffect } from "react";
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

// タグ選択コンテナ
const TagSelectionContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px;
  background-color: #fcfcfc;
  border: 1px solid #eee;
  border-radius: 6px;
`;

// タグラベル
const TagLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 20px;
  background-color: ${props => (props.isChecked ? "#e0eafc" : "#fff")};
  border: 1px solid ${props => (props.isChecked ? "#007bff" : "#ddd")};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => (props.isChecked ? "#d0defa" : "#f0f0f0")};
  }
`;

// タグ用チェックボックス（非表示）
const TagCheckbox = styled.input`
  display: none; /* チェックボックス自体は隠す */
`;

// 画像ギャラリーグリッド
const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin-top: 12px;
`;

// ギャラリー内の各アイテム
const GalleryItem = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* 正方形にする */
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eee;
`;

// ギャラリー内の画像
const RemoveImageButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  font-size: 14px;

  &:hover {
    background-color: rgba(255, 0, 0, 0.8);
  }
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

  // タグ選択用の状態管理
  const [availableTags, setAvailableTags] = useState([]); // DBにある全タグ
  const [selectedTagIds, setSelectedTagIds] = useState([]); // 選択中のタグID

  // 画像ギャラリー用の状態管理
  const [galleryImages, setGalleryImages] = useState([]); // 既存の画像リスト { id, image_url }
  const [newGalleryFiles, setNewGalleryFiles] = useState([]); // 新規追加するファイルリスト { file, previewUrl }
  const [deletedGalleryIds, setDeletedGalleryIds] = useState([]); // 削除する既存画像のIDリスト

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
    appeal: eventToEdit?.appeal || "",
    experience: eventToEdit?.experience || "",
    review: eventToEdit?.review || "",
  });

  // --- データ取得 (タグ & ギャラリー画像) ---
  useEffect(() => {
    // タグ一覧取得
    const fetchTags = async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("id");
      if (!error && data) {
        setAvailableTags(data);
      }
    };
    fetchTags();

    // 編集モード時の初期データセット
    if (isEditMode) {
      // 既存タグのセット
      if (eventToEdit.tags) {
        setSelectedTagIds(eventToEdit.tags.map(t => t.id));
      }

      // 既存ギャラリー画像の取得
      const fetchGalleryImages = async () => {
        const { data, error } = await supabase
          .from("event_images")
          .select("*")
          .eq("event_id", eventToEdit.id);

        if (!error && data) {
          setGalleryImages(data);
        }
      };
      fetchGalleryImages();
    }
  }, [isEditMode, eventToEdit]);

  // --- ハンドラ関連 ---

  const handleTagToggle = tagId => {
    setSelectedTagIds(prev => {
      if (prev.includes(tagId)) return prev.filter(id => id !== tagId);
      else return [...prev, tagId];
    });
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = e => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // --- Dropzone (アイキャッチ用 - 1枚だけ) ---
  const onDropEyeCatch = useCallback(acceptedFiles => {
    if (acceptedFiles && acceptedFiles[0]) {
      const file = acceptedFiles[0];
      setUploadFile(file);
      setFormData(prev => ({
        ...prev,
        image_url: URL.createObjectURL(file),
      }));
    }
  }, []);

  const eyeCatchDropzone = useDropzone({
    onDrop: onDropEyeCatch,
    accept: { "image/*": [] },
    multiple: false,
  });

  //  Dropzone (ギャラリー用 - 複数OK)
  const onDropGallery = useCallback(acceptedFiles => {
    if (acceptedFiles) {
      // 新しいファイルをStateに追加 (プレビューURLも作る)
      const newFiles = acceptedFiles.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setNewGalleryFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const galleryDropzone = useDropzone({
    onDrop: onDropGallery,
    accept: { "image/*": [] },
    multiple: true, // 複数選択OK！
  });

  // ギャラリー画像の削除ハンドラ
  const removeExistingGalleryImage = id => {
    // 画面から消して、削除予定リストに追加
    setGalleryImages(prev => prev.filter(img => img.id !== id));
    setDeletedGalleryIds(prev => [...prev, id]);
  };

  const removeNewGalleryImage = index => {
    // まだアップロードしてないから、単にリストから消すだけ
    setNewGalleryFiles(prev => prev.filter((_, i) => i !== index));
  };

  // --- 送信処理 ---
  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.name || !formData.start_datetime || !formData.end_datetime) {
      alert("イベント名と開始/終了日時は必須です。");
      setIsLoading(false);
      return;
    }

    let submissionData = {
      ...formData,
      start_datetime: new Date(formData.start_datetime).toISOString(),
      end_datetime: new Date(formData.end_datetime).toISOString(),
      fee: parseInt(formData.fee, 10) || 0,
      capacity: parseInt(formData.capacity, 10) || 0,
      latitude: parseFloat(formData.latitude) || null,
      longitude: parseFloat(formData.longitude) || null,
      prefectures: formData.prefecture,
    };
    delete submissionData.prefecture;

    let finalImageUrl = formData.image_url;

    try {
      // アイキャッチ画像のアップロード
      if (uploadFile) {
        const fileExt = uploadFile.name.split(".").pop();
        const fileName = `eyecatch_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("events-images")
          .upload(filePath, uploadFile);

        if (uploadError)
          throw new Error(
            `アイキャッチ画像のアップロード失敗: ${uploadError.message}`
          );

        const { data: urlData } = supabase.storage
          .from("events-images")
          .getPublicUrl(filePath);

        finalImageUrl = urlData.publicUrl;
      }
      submissionData.image_url = finalImageUrl;

      //イベント本体の保存 (INSERT / UPDATE)
      let targetEventId = null;

      if (isEditMode) {
        const { error } = await supabase
          .from("events")
          .update(submissionData)
          .eq("id", eventToEdit.id);
        if (error) throw error;
        targetEventId = eventToEdit.id;
      } else {
        const { data, error } = await supabase
          .from("events")
          .insert([submissionData])
          .select()
          .single();
        if (error) throw error;
        targetEventId = data.id;
      }

      // 中間テーブル (event_tags) の更新
      if (targetEventId) {
        const { error: deleteTagsError } = await supabase
          .from("event_tags")
          .delete()
          .eq("event_id", targetEventId);
        if (deleteTagsError) console.error("タグ削除エラー:", deleteTagsError);

        if (selectedTagIds.length > 0) {
          const tagInsertData = selectedTagIds.map(tagId => ({
            event_id: targetEventId,
            tag_id: tagId,
          }));
          const { error: insertTagsError } = await supabase
            .from("event_tags")
            .insert(tagInsertData);
          if (insertTagsError) throw insertTagsError;
        }

        // ギャラリー画像の保存処理 (ここが新しい！)

        // 削除予定の画像をDBから削除
        if (deletedGalleryIds.length > 0) {
          const { error: deleteImgError } = await supabase
            .from("event_images")
            .delete()
            .in("id", deletedGalleryIds);
          if (deleteImgError) console.error("画像削除エラー:", deleteImgError);
        }

        // 新規画像をアップロードしてDBに追加
        if (newGalleryFiles.length > 0) {
          // Promise.allで並列アップロード
          const uploadPromises = newGalleryFiles.map(async item => {
            const file = item.file;
            const fileExt = file.name.split(".").pop();
            // ファイル名が被らないようにランダムな文字列を入れる
            const fileName = `gallery_${targetEventId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            // Storageにアップロード
            const { error: upError } = await supabase.storage
              .from("events-images")
              .upload(filePath, file);

            if (upError) throw upError;

            // URL取得
            const { data: urlData } = supabase.storage
              .from("events-images")
              .getPublicUrl(filePath);

            return {
              event_id: targetEventId,
              image_url: urlData.publicUrl,
            };
          });

          const uploadedImagesData = await Promise.all(uploadPromises);

          // event_images テーブルに情報を保存
          const { error: insertImgError } = await supabase
            .from("event_images")
            .insert(uploadedImagesData);

          if (insertImgError) throw insertImgError;
        }
      }

      alert(
        isEditMode ? "イベントを更新しました！" : "イベントを作成しました！"
      );
      router.push(`/events/${targetEventId}`);
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

      {/* --- アイキャッチ画像 (Dropzone 1) --- */}
      <FormGroup>
        <Label htmlFor="image_upload">アイキャッチ画像 (1枚)</Label>
        <DropzoneContainer
          {...eyeCatchDropzone.getRootProps()}
          isDragActive={eyeCatchDropzone.isDragActive}
        >
          <input {...eyeCatchDropzone.getInputProps()} />
          {formData.image_url ? (
            <Image
              src={formData.image_url}
              alt="アイキャッチ"
              layout="fill"
              objectFit="cover"
              onError={() => setFormData(prev => ({ ...prev, image_url: "" }))}
            />
          ) : (
            <p style={{ textAlign: "center", padding: "10px" }}>
              クリックまたはドラッグ＆ドロップで選択
            </p>
          )}
        </DropzoneContainer>
      </FormGroup>

      {/* --- 追加画像ギャラリー (Dropzone 2) --- */}
      <FormGroup>
        <Label>追加画像（スライドショー用・複数可）</Label>
        <DropzoneContainer
          {...galleryDropzone.getRootProps()}
          isDragActive={galleryDropzone.isDragActive}
          style={{
            height: "100px",
            backgroundColor: "#f0f8ff",
            borderStyle: "dashed",
          }}
        >
          <input {...galleryDropzone.getInputProps()} />
          <p style={{ textAlign: "center", padding: "10px", color: "#007bff" }}>
            ＋ ここに追加画像をドロップ（またはクリック）
          </p>
        </DropzoneContainer>

        {/* プレビューエリア */}
        {(galleryImages.length > 0 || newGalleryFiles.length > 0) && (
          <GalleryGrid>
            {/* 既存の画像 */}
            {galleryImages.map(img => (
              <GalleryItem key={img.id}>
                <Image
                  src={img.image_url}
                  alt="追加画像"
                  layout="fill"
                  objectFit="cover"
                />
                <RemoveImageButton
                  type="button"
                  onClick={() => removeExistingGalleryImage(img.id)}
                >
                  ×
                </RemoveImageButton>
              </GalleryItem>
            ))}
            {/* 新規追加予定の画像 */}
            {newGalleryFiles.map((item, index) => (
              <GalleryItem key={`new-${index}`}>
                <Image
                  src={item.previewUrl}
                  alt="新規画像"
                  layout="fill"
                  objectFit="cover"
                />
                <RemoveImageButton
                  type="button"
                  onClick={() => removeNewGalleryImage(index)}
                >
                  ×
                </RemoveImageButton>
              </GalleryItem>
            ))}
          </GalleryGrid>
        )}
      </FormGroup>

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

      {/* --- タグ選択 --- */}
      <FormGroup>
        <Label>タグ (複数選択)</Label>
        <TagSelectionContainer>
          {availableTags.length > 0 ? (
            availableTags.map(tag => (
              <TagLabel
                key={tag.id}
                isChecked={selectedTagIds.includes(tag.id)}
              >
                <TagCheckbox
                  type="checkbox"
                  checked={selectedTagIds.includes(tag.id)}
                  onChange={() => handleTagToggle(tag.id)}
                />
                {selectedTagIds.includes(tag.id) && <span>✓</span>}
                {tag.name}
              </TagLabel>
            ))
          ) : (
            <p style={{ color: "#888", fontSize: "0.9rem" }}>
              タグが見つかりません
            </p>
          )}
        </TagSelectionContainer>
      </FormGroup>

      {/* --- その他のフォーム項目 --- */}
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

      <GridWrapper>
        <FormGroup>
          <Label htmlFor="latitude">緯度</Label>
          <Input
            type="number"
            step="any"
            id="latitude"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="longitude">経度</Label>
          <Input
            type="number"
            step="any"
            id="longitude"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
          />
        </FormGroup>
      </GridWrapper>

      <FormGroup>
        <Label htmlFor="short_description">短い紹介文</Label>
        <Textarea
          id="short_description"
          name="short_description"
          value={formData.short_description}
          onChange={handleChange}
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="long_description">長い紹介文</Label>
        <Textarea
          id="long_description"
          name="long_description"
          value={formData.long_description}
          onChange={handleChange}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="website_url">公式サイトURL</Label>
        <Input
          type="url"
          id="website_url"
          name="website_url"
          value={formData.website_url}
          onChange={handleChange}
        />
      </FormGroup>

      <GridWrapper>
        <FormGroup>
          <Label htmlFor="capacity">定員</Label>
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

      <SubmitButton type="submit" disabled={isLoading}>
        {isLoading ? "保存中..." : isEditMode ? "更新する" : "登録する"}
      </SubmitButton>
    </FormContainer>
  );
}
