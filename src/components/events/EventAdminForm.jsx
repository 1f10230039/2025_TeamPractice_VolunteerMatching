// ボランティア登録・編集フォームコンポーネント

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styled from "@emotion/styled";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt, FaImages, FaTrash } from "react-icons/fa";

// --- Emotionでスタイル定義 ---

const FormContainer = styled.form`
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);

  @media (max-width: 600px) {
    padding: 16px;
    margin: 0 auto 150px auto;
    box-shadow: none; /* スマホならフラットに */
  }
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 32px;
  text-align: center;
  color: #333;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 1rem;
  color: #444;

  /* 必須マーク */
  &.required::after {
    content: " *";
    color: #e74c3c;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  box-sizing: border-box;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  box-sizing: border-box;
  min-height: 120px;
  font-family: inherit;
  resize: vertical; /* 縦方向のみリサイズ可 */
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

// --- スマホ対応: 画面幅が狭い時は1列にする ---
const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const CheckboxWrapper = styled.label`
  display: flex;
  align-items: center;
  font-weight: 500;
  gap: 10px;
  cursor: pointer;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eee;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f8ff;
  }
`;

const CheckboxInput = styled.input`
  width: 20px;
  height: 20px;
  accent-color: #007bff;
`;

const SubmitButton = styled.button`
  display: block;
  width: 100%;
  padding: 16px;
  font-size: 1.1rem;
  font-weight: bold;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
  margin-top: 40px;
  box-shadow: 0 4px 6px rgba(0, 123, 255, 0.2);

  &:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// --- 画像アップロードUIの改善 ---
const DropzoneContainer = styled.div`
  width: 100%;
  border-radius: 12px;
  border: 2px dashed ${props => (props.isDragActive ? "#007bff" : "#ccc")};
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
    border-color: #007bff;
    background-color: #f0f8ff;
  }
`;

const UploadIcon = styled.div`
  font-size: 2.5rem;
  color: #007bff;
  margin-bottom: 12px;
  opacity: 0.8;
`;

const UploadText = styled.p`
  font-size: 0.95rem;
  font-weight: bold;
  margin: 0;
  color: #333;
`;

const UploadSubText = styled.span`
  font-size: 0.8rem;
  color: #888;
  margin-top: 4px;
  display: block;
`;

// プレビュー画像（アイキャッチ用）
const EyeCatchPreview = styled.div`
  margin-top: 16px;
  width: 100%;
  height: 250px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #eee;
`;

// ギャラリーグリッド
const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

const GalleryItem = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* 正方形 */
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eee;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.02);
  }
`;

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

// タグコンテナ
const TagSelectionContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px;
  background-color: #fcfcfc;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`;

const TagLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  background-color: ${props => (props.isChecked ? "#e0eafc" : "#fff")};
  border: 1px solid ${props => (props.isChecked ? "#007bff" : "#ddd")};
  color: ${props => (props.isChecked ? "#0056b3" : "#555")};
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    background-color: ${props => (props.isChecked ? "#d0defa" : "#f0f0f0")};
  }
`;

const TagCheckbox = styled.input`
  display: none;
`;

// --- ヘルパー関数 ---
const formatDatetimeLocal = isoString => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    const jstOffset = 9 * 60 * 60 * 1000;
    const jstDate = new Date(date.getTime() + jstOffset);
    return jstDate.toISOString().slice(0, 16);
  } catch (e) {
    return "";
  }
};

export default function EventAdminForm({ eventToEdit }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = Boolean(eventToEdit);

  // 画像・タグの状態
  const [uploadFile, setUploadFile] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [deletedGalleryIds, setDeletedGalleryIds] = useState([]);

  // フォームデータ
  const [formData, setFormData] = useState({
    name: eventToEdit?.name ?? "",
    place: eventToEdit?.place ?? "",
    fee: eventToEdit?.fee ?? 0,
    start_datetime: formatDatetimeLocal(eventToEdit?.start_datetime) ?? "",
    end_datetime: formatDatetimeLocal(eventToEdit?.end_datetime) ?? "",
    image_url: eventToEdit?.image_url ?? "",
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

  useEffect(() => {
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

    if (isEditMode) {
      if (eventToEdit.tags) {
        setSelectedTagIds(eventToEdit.tags.map(t => t.id));
      }
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

  // Dropzone (アイキャッチ)
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

  // Dropzone (ギャラリー)
  const onDropGallery = useCallback(acceptedFiles => {
    if (acceptedFiles) {
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
    multiple: true,
  });

  const removeExistingGalleryImage = id => {
    setGalleryImages(prev => prev.filter(img => img.id !== id));
    setDeletedGalleryIds(prev => [...prev, id]);
  };

  const removeNewGalleryImage = index => {
    setNewGalleryFiles(prev => prev.filter((_, i) => i !== index));
  };

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

        if (deletedGalleryIds.length > 0) {
          const { error: deleteImgError } = await supabase
            .from("event_images")
            .delete()
            .in("id", deletedGalleryIds);
          if (deleteImgError) console.error("画像削除エラー:", deleteImgError);
        }

        if (newGalleryFiles.length > 0) {
          const uploadPromises = newGalleryFiles.map(async item => {
            const file = item.file;
            const fileExt = file.name.split(".").pop();
            const fileName = `gallery_${targetEventId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: upError } = await supabase.storage
              .from("events-images")
              .upload(filePath, file);

            if (upError) throw upError;

            const { data: urlData } = supabase.storage
              .from("events-images")
              .getPublicUrl(filePath);

            return {
              event_id: targetEventId,
              image_url: urlData.publicUrl,
            };
          });

          const uploadedImagesData = await Promise.all(uploadPromises);

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

      {/* --- 基本情報 --- */}
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

      {/* --- 日時 --- */}
      <GridWrapper>
        <FormGroup>
          <Label className="required" htmlFor="start_datetime">
            開始日時
          </Label>
          <Input
            type="datetime-local"
            id="start_datetime"
            name="start_datetime"
            value={formData.start_datetime}
            onChange={handleChange}
            required
          />
        </FormGroup>
        {/* --- 終了日時 --- */}
        <FormGroup>
          <Label className="required" htmlFor="end_datetime">
            終了日時
          </Label>
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

      {/* --- 画像アップロード --- */}
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
              onError={() => setFormData(prev => ({ ...prev, image_url: "" }))}
            />
          </EyeCatchPreview>
        )}
      </FormGroup>

      {/* --- 追加画像ギャラリー --- */}
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
                  <FaTrash size={14} />
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
                  <FaTrash size={14} />
                </RemoveImageButton>
              </GalleryItem>
            ))}
          </GalleryGrid>
        )}
      </FormGroup>

      {/* --- 紹介文 --- */}
      <FormGroup>
        <Label htmlFor="short_description">短い紹介文 (一覧用)</Label>
        <Textarea
          id="short_description"
          name="short_description"
          value={formData.short_description}
          onChange={handleChange}
          placeholder="イベントの概要を100文字程度で入力してください。"
          style={{ minHeight: "80px" }}
        />
      </FormGroup>

      {/* --- 長い紹介文 --- */}
      <FormGroup>
        <Label htmlFor="long_description">長い紹介文 (詳細用)</Label>
        <Textarea
          id="long_description"
          name="long_description"
          value={formData.long_description}
          onChange={handleChange}
          placeholder="イベントの詳細な内容を入力してください。"
        />
      </FormGroup>

      {/* --- 魅力・経験 --- */}
      <FormGroup>
        <Label htmlFor="appeal">このボランティアの魅力</Label>
        <Textarea
          id="appeal"
          name="appeal"
          value={formData.appeal}
          onChange={handleChange}
          placeholder="例: 初心者でも安心して参加できます！お昼には美味しいお弁当が出ます。"
        />
      </FormGroup>

      {/* --- 得られる経験・スキル --- */}
      <FormGroup>
        <Label htmlFor="experience">得られる経験・スキル</Label>
        <Textarea
          id="experience"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          placeholder="例: チームワーク、環境問題への理解、地域の人との交流"
        />
      </FormGroup>

      {/* --- 場所・費用 --- */}
      <GridWrapper>
        {/* --- 開催場所 --- */}
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

        {/* --- 費用 --- */}
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

      {/* --- 都道府県・市町村 --- */}
      <GridWrapper>
        {/* --- 都道府県 --- */}
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

        {/* --- 市町村 --- */}
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

      {/* --- アクセス --- */}
      <FormGroup>
        <Label htmlFor="access">アクセス</Label>
        <Textarea
          id="access"
          name="access"
          value={formData.access}
          onChange={handleChange}
          placeholder="例: ○○駅 徒歩5分"
          style={{ minHeight: "80px" }}
        />
      </FormGroup>

      {/* --- 緯度・経度 --- */}
      <GridWrapper>
        {/* --- 緯度 --- */}
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

        {/* --- 経度 --- */}
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

      {/* --- 公式サイトURL --- */}
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

      {/* --- 定員・主催者 --- */}
      <GridWrapper>
        {/* --- 定員 --- */}
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

        {/* --- 主催者 --- */}
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

      {/* --- 持ち物 --- */}
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

      {/* --- 服装 --- */}
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

      {/* --- 選考フロー --- */}
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

      {/* --- 送信ボタン --- */}
      <SubmitButton type="submit" disabled={isLoading}>
        {isLoading ? "保存中..." : isEditMode ? "更新する" : "登録する"}
      </SubmitButton>
    </FormContainer>
  );
}
