"use client";

import { useState, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import { supabase } from "../../lib/supabaseClient"; // 相対パス
import { useDropzone } from "react-dropzone";
import Breadcrumbs from "../common/Breadcrumbs"; // パンくずリストをインポート
import { FaCamera } from "react-icons/fa";
import { VscAccount } from "react-icons/vsc";

// --- Emotion Style Definitions ---

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: #f5fafc; /* マイページと同じ背景色 */
  padding-bottom: 40px;
  font-family: "Helvetica Neue", Arial, sans-serif;
`;

// パンくずリストを固定するためのラッパー
const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  /* 背景色がないと透けちゃうので指定 */
  background-color: #f5fafc;
`;

const ContentContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  margin: 20px 0 32px 0;
  color: #333;
  text-align: center;
`;

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

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #555;
  font-size: 0.95rem;
`;

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

const Select = styled.select`
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background-color: white;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 24px;
`;

// メインボタン（青グラデーション）
const SubmitButton = styled.button`
  flex: 1;
  background: linear-gradient(135deg, #68b5d5 0%, #4a90e2 100%);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(74, 144, 226, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(74, 144, 226, 0.4);
    filter: brightness(1.05);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(74, 144, 226, 0.2);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

// キャンセルボタン（白背景・シンプル）
const CancelButton = styled.button`
  flex: 1;
  background-color: #fff;
  color: #666;
  border: 2px solid #eee;
  padding: 14px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f9f9f9;
    border-color: #ddd;
    color: #444;
  }
`;

// --- アバター編集用のスタイル ---
const AvatarContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  cursor: pointer;
  border: 4px solid #fff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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

// next/image の代わりに通常の img タグを使用
const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
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
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || "");
  const [uploadFile, setUploadFile] = useState(null);

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

  // --- データ取得関連 ---
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
        const fileName = `${initialProfile.id}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Storageにアップロード
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, uploadFile, { upsert: true });

        if (uploadError)
          throw new Error(`画像アップロード失敗: ${uploadError.message}`);

        // 公開URLを取得
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        finalAvatarUrl = urlData.publicUrl;
      }

      // 2. プロフィール情報を更新 (UPDATE)
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
      window.location.href = "/mypage";
    } catch (error) {
      console.error("更新エラー:", error);
      alert(`更新に失敗しました: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // パンくずリスト用データ
  const crumbs = [{ label: "プロフィール編集", href: "/mypage/edit" }];
  const baseCrumb = { label: "マイページ", href: "/mypage" };

  return (
    <PageWrapper>
      {/* 画面上部に固定されるパンくずリスト */}
      <StickyHeader>
        <Breadcrumbs crumbs={crumbs} baseCrumb={baseCrumb} />
      </StickyHeader>

      <ContentContainer>
        <Title>プロフィール編集</Title>

        {/* 画像アップロードエリア */}
        <AvatarContainer>
          <AvatarWrapper {...getRootProps()} isDragActive={isDragActive}>
            <input {...getInputProps()} />

            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="Avatar" />
            ) : (
              <AvatarPlaceholder>
                <VscAccount />
              </AvatarPlaceholder>
            )}

            {/* ホバー時にカメラアイコンを出すオーバーレイ */}
            <CameraOverlay>
              <FaCamera />
            </CameraOverlay>
          </AvatarWrapper>
        </AvatarContainer>
        <p
          style={{
            textAlign: "center",
            fontSize: "0.85rem",
            color: "#666",
            marginBottom: "32px",
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
            <CancelButton type="button" onClick={() => window.history.back()}>
              キャンセル
            </CancelButton>
            <SubmitButton type="submit" disabled={loading}>
              {loading ? "更新中..." : "更新する"}
            </SubmitButton>
          </ButtonGroup>
        </Form>
      </ContentContainer>
    </PageWrapper>
  );
}
