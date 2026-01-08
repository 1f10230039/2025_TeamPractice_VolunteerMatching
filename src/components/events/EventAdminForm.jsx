// ボランティア募集管理用のイベント編集フォームコンポーネント
"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styled from "@emotion/styled";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt, FaImages, FaTrash } from "react-icons/fa";
import { FiSave, FiX, FiStar, FiCheck } from "react-icons/fi";
import Breadcrumbs from "../common/Breadcrumbs";

// --- Emotion Styles ---
// ページ全体のラッパー
const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: #f5fafc;
  padding-bottom: 80px;
  font-family: "Helvetica Neue", Arial, sans-serif;
`;

// スティッキーヘッダー
const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #f5fafc;
  padding-bottom: 10px;
`;

// フォームコンテナ
const FormContainer = styled.form`
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(122, 211, 232, 0.15);
  border: 1px solid #f0f8ff;

  @media (max-width: 600px) {
    padding: 24px;
    margin: 0 16px 100px 16px;
  }
`;

// ページタイトル
const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 800;
  margin: 10px 0 32px 0;
  color: #333;
  text-align: center;
  letter-spacing: 0.05em;
`;

// 特別設定ボックス（おすすめフラグ用）
const SpecialSettingsBox = styled.div`
  background-color: #fff9e6;
  border: 2px solid #ffeba8;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

// おすすめラベル
const SpecialLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  color: #d48806;
  font-size: 1rem;
  cursor: pointer;
`;

// トグルスイッチのデザイン
const ToggleSwitch = styled.div`
  position: relative;
  width: 52px;
  height: 28px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 34px;
  }

  span:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  input:checked + span {
    background-color: #f39c12;
  }

  input:checked + span:before {
    transform: translateX(24px);
  }
`;

// フォームグループ
const FormGroup = styled.div`
  margin-bottom: 28px;
`;

// ラベルスタイル
const Label = styled.label`
  display: block;
  font-weight: 700;
  margin-bottom: 10px;
  font-size: 0.95rem;
  color: #444;

  &.required::after {
    content: " *";
    color: #e74c3c;
    margin-left: 4px;
  }
`;

// 入力フィールドスタイル
const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background-color: #f9f9f9;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4a90e2;
    background-color: #fff;
    box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.1);
  }
`;

// テキストエリアスタイル
const Textarea = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background-color: #f9f9f9;
  min-height: 120px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4a90e2;
    background-color: #fff;
    box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.1);
  }
`;

// 共通ボタンスタイル
const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

// 日付入力用のラッパー
const DateInputWrapper = styled.div`
  width: 100%;
  input {
    font-family: inherit;
  }
`;

// ボタン群コンテナ
const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px dashed #eee;

  @media (max-width: 600px) {
    flex-direction: column-reverse;
    width: 100%;

    button {
      width: 100%;
      justify-content: center;
    }
  }
`;

// ベースボタンスタイル
const BaseButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
`;

// 送信ボタンスタイル
const SubmitButton = styled(BaseButton)`
  background: linear-gradient(135deg, #68b5d5 0%, #4a90e2 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 10px rgba(74, 144, 226, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(74, 144, 226, 0.4);
    filter: brightness(1.05);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

// キャンセルボタンスタイル
const CancelButton = styled(BaseButton)`
  background-color: #fff;
  color: #666;
  border: 2px solid #eee;

  &:hover {
    background-color: #f9f9f9;
    border-color: #ddd;
    color: #444;
  }
`;

// 画像アップロードUI
const DropzoneContainer = styled.div`
  width: 100%;
  border-radius: 12px;
  border: 2px dashed ${props => (props.isDragActive ? "#4a90e2" : "#ccc")};
  background-color: ${props => (props.isDragActive ? "#f0f8ff" : "#fafafa")};
  color: #666;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  min-height: ${props => props.minHeight || "auto"};

  &:hover {
    border-color: #4a90e2;
    background-color: #f0f8ff;
  }
`;

// アップロードアイコン
const UploadIcon = styled.div`
  font-size: 2.5rem;
  color: #4a90e2;
  margin-bottom: 12px;
  opacity: 0.8;
`;

// アップロードテキスト
const UploadText = styled.p`
  font-size: 0.95rem;
  font-weight: bold;
  margin: 0;
  color: #333;
`;

// サブテキスト
const UploadSubText = styled.span`
  font-size: 0.8rem;
  color: #888;
  margin-top: 4px;
  display: block;
`;

// アイキャッチ画像プレビュー
const EyeCatchPreview = styled.div`
  margin-top: 16px;
  width: 100%;
  height: 250px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #eee;
`;

// ギャラリーグリッド
const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

// ギャラリーアイテム
const GalleryItem = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #eee;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.02);
  }
`;

// ギャラリー画像
const RemoveImageButton = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;
  background-color: rgba(255, 255, 255, 0.9);
  color: #ff4d4d;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s;

  &:hover {
    background-color: #ffcccc;
  }
`;

// タグ選択コンテナ
const TagSelectionContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 20px;
  background-color: #fcfcfc;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
`;

// タグラベルスタイル
const TagLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  background-color: ${props => (props.isChecked ? "#e0eafc" : "#fff")};
  border: 1px solid ${props => (props.isChecked ? "#4a90e2" : "#ddd")};
  color: ${props => (props.isChecked ? "#0056b3" : "#555")};
  font-weight: 500;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    background-color: ${props => (props.isChecked ? "#d0defa" : "#f0f0f0")};
  }
`;

// タグ用チェックボックス（非表示）
const TagCheckbox = styled.input`
  display: none;
`;

// --- ヘルパー関数 ---
// ISO文字列をdatetime-local形式に変換
const formatDatetimeLocal = isoString => {
  // もし値がなければ空文字を返す
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    // もし不正な日付なら空文字を返す
    if (isNaN(date.getTime())) return "";
    // JSTに変換
    const jstOffset = 9 * 60 * 60 * 1000;
    const jstDate = new Date(date.getTime() + jstOffset);
    // datetime-local形式にフォーマットして返す
    return jstDate.toISOString().slice(0, 16);
  } catch (e) {
    // エラーが発生した場合も空文字を返す
    return "";
  }
};

// --- Component 本体 ---
// イベント管理用フォームコンポーネント
export default function EventAdminForm({ eventToEdit }) {
  // --- State管理 ---
  // Next.jsのルーター
  const router = useRouter();
  // ローディング状態
  const [isLoading, setIsLoading] = useState(false);
  // 編集モードかどうか
  const isEditMode = Boolean(eventToEdit);
  // アップロード中のアイキャッチ画像ファイル
  const [uploadFile, setUploadFile] = useState(null);
  // 利用可能なタグ一覧
  const [availableTags, setAvailableTags] = useState([]);
  // 選択中のタグID一覧
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  // ギャラリー画像関連の状態
  const [galleryImages, setGalleryImages] = useState([]);
  // 新規アップロード予定のギャラリー画像ファイル一覧
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  // 削除予定の既存ギャラリー画像ID一覧
  const [deletedGalleryIds, setDeletedGalleryIds] = useState([]);
  // フォームデータ
  const [formData, setFormData] = useState({
    name: eventToEdit?.name ?? "",
    place: eventToEdit?.place ?? "",
    fee: eventToEdit?.fee ?? 0,
    start_datetime: formatDatetimeLocal(eventToEdit?.start_datetime) ?? "",
    end_datetime: formatDatetimeLocal(eventToEdit?.end_datetime) ?? "",
    image_url: eventToEdit?.image_url ?? "",
    recommended: eventToEdit?.recommended ?? false,
    favorite: eventToEdit?.favorite ?? false,
    short_description: eventToEdit?.short_description ?? "",
    long_description: eventToEdit?.long_description ?? "",
    website_url: eventToEdit?.website_url ?? "",
    capacity: eventToEdit?.capacity ?? 0,
    organaizer: eventToEdit?.organaizer ?? "",
    latitude: eventToEdit?.latitude ?? "",
    longitude: eventToEdit?.longitude ?? "",
    belongings: eventToEdit?.belongings ?? "",
    clothing: eventToEdit?.clothing ?? "",
    selection_flow: eventToEdit?.selection_flow ?? "",
    access: eventToEdit?.access ?? "",
    applied: eventToEdit?.applied ?? false,
    city: eventToEdit?.city ?? "",
    prefecture: eventToEdit?.prefectures ?? "",
    appeal: eventToEdit?.appeal ?? "",
    experience: eventToEdit?.experience ?? "",
    review: eventToEdit?.review ?? "",
  });

  // 初回マウント時に利用可能なタグ一覧を取得
  // 編集モードなら選択中タグとギャラリー画像もセット
  useEffect(() => {
    // タグ一覧を取得
    const fetchTags = async () => {
      // tagsテーブルから全タグを取得
      const { data, error } = await supabase
        .from("tags") // tagsテーブルから
        .select("*") // 全カラム取得
        .order("id"); // id順にソート
      // もしエラーがなければセット
      if (!error && data) setAvailableTags(data);
    };
    // タグ一覧取得を実行
    fetchTags();

    // もし編集モードなら、選択中タグとギャラリー画像をセット
    if (isEditMode) {
      // もしタグがあればセット
      if (eventToEdit.tags) {
        setSelectedTagIds(eventToEdit.tags.map(t => t.id));
      }
      // ギャラリー画像を取得してセット
      const fetchGalleryImages = async () => {
        // event_imagesテーブルから該当イベントの画像を取得
        const { data, error } = await supabase
          .from("event_images") // event_imagesテーブルから
          .select("*") // 全カラム取得
          .eq("event_id", eventToEdit.id); // 該当イベントIDで絞り込み
        // もしエラーがなければセット
        if (!error && data) setGalleryImages(data);
      };
      // ギャラリー画像取得を実行
      fetchGalleryImages();
    }
  }, [isEditMode, eventToEdit]);

  // --- ハンドラー関数群 ---
  // タグ選択の処理
  const handleTagToggle = tagId => {
    // 選択中タグID一覧を更新
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  // 入力フィールドの変更処理
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // チェックボックス（おすすめフラグなど）の処理
  const handleCheckboxChange = e => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // アイキャッチ画像のドロップ処理
  const onDropEyeCatch = useCallback(acceptedFiles => {
    // もしファイルがあれば先頭のファイルをセット
    if (acceptedFiles && acceptedFiles[0]) {
      const file = acceptedFiles[0];
      setUploadFile(file);
      setFormData(prev => ({ ...prev, image_url: URL.createObjectURL(file) }));
    }
  }, []);

  // アイキャッチ画像用ドロップゾーン設定
  const eyeCatchDropzone = useDropzone({
    onDrop: onDropEyeCatch,
    accept: { "image/*": [] },
    multiple: false,
  });

  // ギャラリー画像のドロップ処理
  const onDropGallery = useCallback(acceptedFiles => {
    // もしファイルがあれば新規ギャラリーファイル一覧に追加
    if (acceptedFiles) {
      const newFiles = acceptedFiles.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setNewGalleryFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  // ギャラリー画像用ドロップゾーン設定
  const galleryDropzone = useDropzone({
    onDrop: onDropGallery,
    accept: { "image/*": [] },
    multiple: true,
  });

  // 既存ギャラリー画像の削除処理
  const removeExistingGalleryImage = id => {
    setGalleryImages(prev => prev.filter(img => img.id !== id));
    setDeletedGalleryIds(prev => [...prev, id]);
  };

  // 新規ギャラリー画像の削除処理
  const removeNewGalleryImage = index => {
    setNewGalleryFiles(prev => prev.filter((_, i) => i !== index));
  };

  // フォーム送信処理
  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    // もし必須項目が未入力なら警告を出して終了
    if (!formData.name || !formData.start_datetime || !formData.end_datetime) {
      alert("イベント名と開始/終了日時は必須です。");
      setIsLoading(false);
      return;
    }

    // アップロード後の最終的な画像URL
    let finalImageUrl = formData.image_url;

    // イベントデータの保存処理
    try {
      // もし新しいアイキャッチ画像がアップロードされていれば、Supabase Storageにアップロード
      if (uploadFile) {
        // ファイル名とパスを生成してアップロード
        const fileExt = uploadFile.name.split(".").pop();
        const fileName = `eyecatch_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("events-images")
          .upload(filePath, uploadFile);
        // もしアップロードエラーがあれば例外を投げる
        if (uploadError)
          throw new Error(
            `アイキャッチ画像のアップロード失敗: ${uploadError.message}`
          );
        // アップロード成功なら公開URLを取得
        const { data: urlData } = supabase.storage
          .from("events-images")
          .getPublicUrl(filePath);
        // 最終画像URLを更新
        finalImageUrl = urlData.publicUrl;
      }

      // APIに送信するイベントデータ本体を準備
      const submissionData = {
        ...formData,
        image_url: finalImageUrl,
        start_datetime: new Date(formData.start_datetime).toISOString(),
        end_datetime: new Date(formData.end_datetime).toISOString(),
        fee: parseInt(formData.fee, 10) || 0,
        capacity: parseInt(formData.capacity, 10) || 0,
        latitude: parseFloat(formData.latitude) || null,
        longitude: parseFloat(formData.longitude) || null,
        prefectures: formData.prefecture,
      };
      // 不要なフィールドを削除
      delete submissionData.prefecture;

      // もし編集モードならIDを追加
      if (isEditMode) {
        submissionData.id = eventToEdit.id;
      }

      // バックエンドAPIを呼び出して、イベントの登録/更新とベクトル化を実行
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventData: submissionData,
          selectedTagIds,
        }),
      });

      // もしレスポンスがOKでなければエラーを投げる
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "APIリクエストに失敗しました。");
      }

      // レスポンスデータを取得
      const result = await response.json();
      // 登録または更新されたイベントIDを取得
      const targetEventId = result.eventId;

      // ギャラリー画像の処理
      if (targetEventId) {
        // もし削除予定のギャラリー画像があれば削除
        if (deletedGalleryIds.length > 0) {
          // 既存画像を削除
          const { error: deleteImgError } = await supabase
            .from("event_images") // event_imagesテーブルから
            .delete() // 削除
            .in("id", deletedGalleryIds); // 削除対象IDを指定
          // もし削除エラーがあればコンソールに出力
          if (deleteImgError) console.error("画像削除エラー:", deleteImgError);
        }

        // もし新規アップロード予定のギャラリー画像があればアップロード
        if (newGalleryFiles.length > 0) {
          // 各画像をアップロードしてデータを準備
          const uploadPromises = newGalleryFiles.map(async item => {
            const file = item.file;
            const fileExt = file.name.split(".").pop();
            const fileName = `gallery_${targetEventId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;
            const { error: upError } = await supabase.storage
              .from("events-images") // events-imagesストレージに
              .upload(filePath, file); // アップロード
            // もしアップロードエラーがあれば例外を投げる
            if (upError) throw upError;
            const { data: urlData } = supabase.storage
              .from("events-images") // events-imagesストレージから
              .getPublicUrl(filePath); // 公開URLを取得
            // イベント画像データを返す
            return { event_id: targetEventId, image_url: urlData.publicUrl };
          });
          // すべての画像アップロードを実行
          const uploadedImagesData = await Promise.all(uploadPromises);
          const { error: insertImgError } = await supabase
            .from("event_images") // event_imagesテーブルに
            .insert(uploadedImagesData); // 複数行挿入
          // もし挿入エラーがあれば例外を投げる
          if (insertImgError) throw insertImgError;
        }
      }
      // イベント保存成功のメッセージを表示してリダイレクト
      alert(result.message);
      router.push(`/events/${targetEventId}?source=admin`);
      router.refresh();
    } catch (error) {
      console.error("イベントの保存に失敗:", error.message);
      alert(`エラーが発生しました: ${error.message}`);
      // エラー時はローディングを解除して終了
    } finally {
      setIsLoading(false);
    }
  };

  // パンくずリスト
  const crumbs = [
    { label: "ボランティア管理", href: "/volunteer-registration/admin/events" }, // ボランティア管理トップ
    { label: isEditMode ? "編集" : "新規登録", href: "#" }, // 現在のページ
  ];
  const baseCrumb = { label: "マイページ", href: "/mypage" }; // ベースパンくず

  // --- JSXレンダリング ---
  return (
    <PageWrapper>
      <StickyHeader>
        <Breadcrumbs crumbs={crumbs} baseCrumb={baseCrumb} />
      </StickyHeader>

      <FormContainer onSubmit={handleSubmit}>
        <PageTitle>
          {isEditMode ? "ボランティアを編集" : "ボランティアを新規登録"}
        </PageTitle>

        {/* おすすめフラグ設定 */}
        <SpecialSettingsBox>
          <SpecialLabel htmlFor="recommended">
            <FiStar size={20} />
            「おすすめ」イベントとしてトップページに表示する
          </SpecialLabel>
          <ToggleSwitch>
            <label>
              <input
                type="checkbox"
                id="recommended"
                name="recommended"
                checked={formData.recommended}
                onChange={handleCheckboxChange}
              />
              <span></span>
            </label>
          </ToggleSwitch>
        </SpecialSettingsBox>

        {/* イベント名 */}
        <FormGroup>
          <Label className="required" htmlFor="name">
            イベント名
          </Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="例: 第1回 ビーチクリーン活動"
          />
        </FormGroup>

        {/* 開始日時と終了日時 */}
        <GridWrapper>
          <FormGroup>
            <Label className="required" htmlFor="start_datetime">
              開始日時
            </Label>
            <DateInputWrapper>
              <Input
                type="datetime-local"
                id="start_datetime"
                name="start_datetime"
                value={formData.start_datetime}
                onChange={handleChange}
                required
              />
            </DateInputWrapper>
          </FormGroup>
          <FormGroup>
            <Label className="required" htmlFor="end_datetime">
              終了日時
            </Label>
            <DateInputWrapper>
              <Input
                type="datetime-local"
                id="end_datetime"
                name="end_datetime"
                value={formData.end_datetime}
                onChange={handleChange}
                required
              />
            </DateInputWrapper>
          </FormGroup>
        </GridWrapper>

        {/* タグ選択 */}
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
                  {selectedTagIds.includes(tag.id) && <FiCheck />}
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

        {/* アイキャッチ画像 */}
        <FormGroup>
          <Label>アイキャッチ画像 (1枚)</Label>
          <DropzoneContainer
            {...eyeCatchDropzone.getRootProps()}
            isDragActive={eyeCatchDropzone.isDragActive}
          >
            <input {...eyeCatchDropzone.getInputProps()} />
            <UploadIcon>
              <FaCloudUploadAlt />
            </UploadIcon>
            <UploadText>
              {eyeCatchDropzone.isDragActive
                ? "ここにドロップ！"
                : "クリックまたは画像をドラッグ"}
            </UploadText>
            <UploadSubText>PNG, JPG, WebP (最大5MB)</UploadSubText>
          </DropzoneContainer>
          {formData.image_url && (
            <EyeCatchPreview>
              <Image
                src={formData.image_url}
                alt="アイキャッチ"
                layout="fill"
                objectFit="cover"
                onError={() =>
                  setFormData(prev => ({ ...prev, image_url: "" }))
                }
              />
            </EyeCatchPreview>
          )}
        </FormGroup>

        {/* 追加画像 */}
        <FormGroup>
          <Label>追加画像（スライドショー用・複数可）</Label>
          <DropzoneContainer
            {...galleryDropzone.getRootProps()}
            isDragActive={galleryDropzone.isDragActive}
            minHeight="150px"
          >
            <input {...galleryDropzone.getInputProps()} />
            <UploadIcon style={{ fontSize: "2rem", marginBottom: "8px" }}>
              <FaImages />
            </UploadIcon>
            <UploadText>追加画像を選択</UploadText>
            <UploadSubText>複数枚アップロードできます</UploadSubText>
          </DropzoneContainer>
          {(galleryImages.length > 0 || newGalleryFiles.length > 0) && (
            <GalleryGrid>
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
                    <FaTrash size={14} />
                  </RemoveImageButton>
                </GalleryItem>
              ))}
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
                    <FaTrash size={14} />
                  </RemoveImageButton>
                </GalleryItem>
              ))}
            </GalleryGrid>
          )}
        </FormGroup>

        {/* 短い紹介文 */}
        <FormGroup>
          <Label htmlFor="short_description">短い紹介文 (一覧用)</Label>
          <Textarea
            id="short_description"
            name="short_description"
            value={formData.short_description}
            onChange={handleChange}
            style={{ minHeight: "80px" }}
          />
        </FormGroup>

        {/* 長い紹介文 */}
        <FormGroup>
          <Label htmlFor="long_description">長い紹介文 (詳細用)</Label>
          <Textarea
            id="long_description"
            name="long_description"
            value={formData.long_description}
            onChange={handleChange}
          />
        </FormGroup>

        {/* このボランティアの魅力 */}
        <FormGroup>
          <Label htmlFor="appeal">このボランティアの魅力 </Label>
          <Textarea
            id="appeal"
            name="appeal"
            value={formData.appeal}
            onChange={handleChange}
          />
        </FormGroup>

        {/* 得られる経験・スキル */}
        <FormGroup>
          <Label htmlFor="experience">得られる経験・スキル </Label>
          <Textarea
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
          />
        </FormGroup>

        {/* 開催場所 */}
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

          {/* 費用 */}
          <FormGroup>
            <Label htmlFor="fee" className="required">
              費用
            </Label>
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

        {/* 都道府県と市町村 */}
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

        {/* アクセス */}
        <FormGroup>
          <Label htmlFor="access">アクセス</Label>
          <Textarea
            id="access"
            name="access"
            value={formData.access}
            onChange={handleChange}
            style={{ minHeight: "80px" }}
          />
        </FormGroup>

        {/* 緯度と経度 */}
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

        {/* 公式サイトURL */}
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

        {/* 定員と主催者 */}
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

        {/* 持ち物、服装、選考フロー */}
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
            style={{ minHeight: "80px" }}
          />
        </FormGroup>

        <ButtonContainer>
          <CancelButton
            type="button"
            onClick={() => router.push("/volunteer-registration/admin/events")}
          >
            <FiX />
            <span>キャンセル</span>
          </CancelButton>
          <SubmitButton type="submit" disabled={isLoading}>
            <FiSave />
            <span>
              {isLoading ? "保存中..." : isEditMode ? "更新する" : "登録する"}
            </span>
          </SubmitButton>
        </ButtonContainer>
      </FormContainer>
    </PageWrapper>
  );
}
