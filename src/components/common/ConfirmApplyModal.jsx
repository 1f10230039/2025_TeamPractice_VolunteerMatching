// 最終確認画面コンポーネント
"use client";

import styled from "@emotion/styled";

// --- スタイル定義 ---

// モーダルの背景 (画面全体を覆う)
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; // 詳細ページのActionMenu(50)より手前に
`;

// モーダルの本体
const ModalContent = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  // アニメーション（任意）
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const ModalTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0 0 16px 0;
`;

const ModalBody = styled.p`
  margin-bottom: 24px;
  line-height: 1.6;
  // イベント名を強調
  & > strong {
    color: #0056b3;
    font-weight: bold;
  }
`;

const ModalButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

// ボタンのベーススタイル
const ModalButton = styled.button`
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease;
  font-size: 0.9rem;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

// キャンセルボタン
const CancelButton = styled(ModalButton)`
  background-color: #f0f0f0;
  color: #333;

  &:hover {
    background-color: #e0e0e0;
  }
`;

// 確認（応募）ボタン
const ConfirmButton = styled(ModalButton)`
  background-color: #007bff;
  color: white;

  &:hover {
    background-color: #0056b3;
  }
`;

/**
 * @param {{
 * isOpen: boolean,         // モーダルを開くかどうか
 * onClose: () => void,     // モーダルを閉じる関数
 * onConfirm: (e) => void, // 「応募する」が押された時の関数
 * eventName: string,       // 表示するイベント名
 * isLoading: boolean       // 応募処理中のローディング状態
 * }} props
 */
export default function ConfirmApplyModal({
  isOpen,
  onClose,
  onConfirm,
  eventName,
  isLoading,
}) {
  // isOpenがfalseなら、何もレンダリングしない
  if (!isOpen) {
    return null;
  }

  // 背景クリックで閉じる（ただしローディング中は閉じない）
  const handleBackdropClick = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <ModalBackdrop onClick={handleBackdropClick}>
      {/* モーダルの中身をクリックしても閉じないようにする */}
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalTitle>応募の確認</ModalTitle>
        <ModalBody>
          <strong>{eventName || "このイベント"}</strong>
          に応募します。よろしいですか？
        </ModalBody>
        <ModalButtonContainer>
          <CancelButton onClick={onClose} disabled={isLoading}>
            キャンセル
          </CancelButton>
          <ConfirmButton onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "処理中..." : "応募する"}
          </ConfirmButton>
        </ModalButtonContainer>
      </ModalContent>
    </ModalBackdrop>
  );
}
