"use client";

import { useState, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

// --- インラインSVGアイコン ---
const UserCircleIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 496 512"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 96c48.6 0 88 39.4 88 88s-39.4 88-88 88-88-39.4-88-88 39.4-88 88-88zm0 344c-58.7 0-111.3-26.6-146.5-68.2 18.8-35.4 55.6-59.8 98.5-59.8 2.4 0 4.8.4 7.1 1.1 13 4.2 26.6 6.9 40.9 6.9 14.3 0 28-2.7 40.9-6.9 2.3-.7 4.7-1.1 7.1-1.1 42.9 0 79.7 24.4 98.5 59.8C359.3 421.4 306.7 448 248 448z"></path>
  </svg>
);
const CameraIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 512 512"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M512 144v288c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V144c0-26.5 21.5-48 48-48h88l12.3-32.9c7-18.7 24.9-31.1 44.9-31.1h125.5c20 0 37.9 12.4 44.9 31.1L376 96h88c26.5 0 48 21.5 48 48zM376 288c0-66.2-53.8-120-120-120s-120 53.8-120 120 53.8 120 120 120 120-53.8 120-120zm-32 0c0 48.6-39.4 88-88 88s-88-39.4-88-88 39.4-88 88-88 88 39.4 88 88z"></path>
  </svg>
);

// --- Emotion Style Definitions ---

const Wrapper = styled.div`
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
  @media (max-width: 600px) {
    margin-bottom: 150px;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 12px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #555;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
`;

const SubmitButton = styled.button`
  flex: 1;
  background-color: #28a745;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    background-color: #218838;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #5a6268;
  }
`;

// --- アバター編集用のスタイル ---
const AvatarContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  cursor: pointer;
  border: 4px solid #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  background-color: #f0f8ff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
    border-color: #e0eafc;
  }

  /* ドラッグ中のスタイル */
  ${props =>
    props.isDragActive &&
    `
    border-color: #007bff;
    background-color: #e6f2ff;
  `}
`;

const AvatarImage = styled(Image)`
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  font-size: 80px;
  color: #a0c4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const CameraOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  height: 30%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
`;

export default function ProfileEditPage({ initialProfile, universities }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // フォーム入力値
  const [name, setName] = useState(initialProfile?.name || "");
  const [selectedUniversity, setSelectedUniversity] = useState(
    initialProfile?.university_id || ""
  );
  const [selectedFaculty, setSelectedFaculty] = useState(
    initialProfile?.faculty_id || ""
  );

  // 画像関連のState
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || ""); // 表示用URL
  const [uploadFile, setUploadFile] = useState(null); // アップロードするファイル

  const [faculties, setFaculties] = useState([]);

  // --- Dropzone設定 ---
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles && acceptedFiles[0]) {
      const file = acceptedFiles[0];
      setUploadFile(file);
      // プレビュー用にローカルURLを生成
      setAvatarUrl(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  // --- データ取得関連 (既存コード) ---
  const fetchFaculties = async uniId => {
    if (!uniId) {
      setFaculties([]);
      return;
    }
    const { data } = await supabase
      .from("faculties")
      .select("id, name")
      .eq("university_id", uniId);
    setFaculties(data || []);
  };

  useEffect(() => {
    if (selectedUniversity) {
      fetchFaculties(selectedUniversity);
    }
  }, []);

  const handleUniversityChange = e => {
    const uniId = e.target.value;
    setSelectedUniversity(uniId);
    setSelectedFaculty("");
    fetchFaculties(uniId);
  };

  // --- 送信処理 ---
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalAvatarUrl = avatarUrl;

      // 1. 画像が新しく選択されていたらアップロード
      if (uploadFile) {
        const fileExt = uploadFile.name.split(".").pop();
        const fileName = `${initialProfile.id}/${Date.now()}.${fileExt}`; // ユーザーIDごとのフォルダに保存
        const filePath = `${fileName}`;

        // Storageにアップロード
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, uploadFile, { upsert: true }); // 上書き許可

        if (uploadError)
          throw new Error(`画像アップロード失敗: ${uploadError.message}`);

        // 公開URLを取得
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        finalAvatarUrl = urlData.publicUrl;
      }

      // 2. プロフィール情報を更新 (UPDATE)
      // (もし uploadFile がなくても、既存の avatarUrl をそのまま使うか、変更なしで送る)
      const { error } = await supabase
        .from("profiles")
        .update({
          name: name,
          university_id: selectedUniversity,
          faculty_id: selectedFaculty,
          avatar_url: finalAvatarUrl,
        })
        .eq("id", initialProfile.id);

      if (error) throw error;

      alert("プロフィールを更新しました！");
      router.refresh();
      window.location.href = "/mypage";
    } catch (error) {
      console.error("更新エラー:", error);
      alert(`更新に失敗しました: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Title>プロフィール編集</Title>

      {/* 画像アップロードエリア */}
      <AvatarContainer>
        <AvatarWrapper {...getRootProps()} isDragActive={isDragActive}>
          <input {...getInputProps()} />

          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt="Avatar" layout="fill" />
          ) : (
            <AvatarPlaceholder>
              <UserCircleIcon />
            </AvatarPlaceholder>
          )}

          {/* ホバー時にカメラアイコンを出すオーバーレイ */}
          <CameraOverlay>
            <CameraIcon />
          </CameraOverlay>
        </AvatarWrapper>
      </AvatarContainer>
      <p
        style={{
          textAlign: "center",
          fontSize: "0.85rem",
          color: "#666",
          marginBottom: "20px",
        }}
      >
        アイコンをタップして画像を変更
      </p>

      <Form onSubmit={handleSubmit}>
        {/* 名前入力 */}
        <FormGroup>
          <Label>名前</Label>
          <Input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </FormGroup>

        {/* 大学選択 */}
        <FormGroup>
          <Label>大学</Label>
          <Select
            value={selectedUniversity}
            onChange={handleUniversityChange}
            required
          >
            <option value="">選択してください</option>
            {universities.map(uni => (
              <option key={uni.id} value={uni.id}>
                {uni.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        {/* 学部選択 */}
        <FormGroup>
          <Label>学部</Label>
          <Select
            value={selectedFaculty}
            onChange={e => setSelectedFaculty(e.target.value)}
            required
            disabled={!selectedUniversity}
          >
            <option value="">選択してください</option>
            {faculties.map(fac => (
              <option key={fac.id} value={fac.id}>
                {fac.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        {/* ボタンエリア */}
        <ButtonGroup>
          <CancelButton type="button" onClick={() => router.back()}>
            キャンセル
          </CancelButton>
          <SubmitButton type="submit" disabled={loading}>
            {loading ? "更新中..." : "更新する"}
          </SubmitButton>
        </ButtonGroup>
      </Form>
    </Wrapper>
  );
}
