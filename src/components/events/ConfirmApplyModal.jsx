// モーダルコンポーネント
"use client";

import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import {
  FaPaperPlane,
  FaTimes,
  FaExclamationTriangle,
  FaQuestionCircle,
  FaCheckCircle,
} from "react-icons/fa";

// --- Animation ---
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
`;

// --- Emotion Styles ---
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 32px;
  border-radius: 24px;
  width: 90%;
  max-width: 440px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: ${slideUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

// タイトル上のアイコンサークル
const IconCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin-bottom: 20px;
  background-color: ${props =>
    props.mode === "destructive"
      ? "#ffebee"
      : props.mode === "success"
        ? "#e8f5e9"
        : "#e3f2fd"};

  color: ${props =>
    props.mode === "destructive"
      ? "#ef5350"
      : props.mode === "success"
        ? "#42e695"
        : "#4a90e2"};
`;

const ModalTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 800;
  color: #333;
  margin: 0 0 12px 0;
`;

const ModalBody = styled.div`
  font-size: 1rem;
  color: #666;
  line-height: 1.7;
  margin-bottom: 32px;
  width: 100%;

  strong {
    color: #4a90e2;
    font-weight: 700;
  }
`;

const ModalButtonContainer = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
  justify-content: center;
`;

// 共通ボタンスタイル
const BaseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  flex: 1;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    filter: grayscale(100%);
  }

  svg {
    font-size: 1.1em;
  }

  @media (max-width: 600px) {
    font-size: 0.9rem;
    padding: 10px 12px;
  }
`;

// キャンセルボタン
const CancelButton = styled(BaseButton)`
  background-color: transparent;
  color: #888;
  border: 2px solid #eee;

  &:hover {
    background-color: #f9f9f9;
    color: #555;
    border-color: #ddd;
  }

  @media (max-width: 600px) {
    font-size: 0.9rem;
  }
`;

// メインボタン
const ConfirmButton = styled(BaseButton)`
  background: ${props =>
    props.isDestructive
      ? "linear-gradient(135deg, #ff9a9e 0%, #ff6a88 100%)"
      : "linear-gradient(135deg, #68b5d5 0%, #4a90e2 100%)"};

  color: white;
  box-shadow: ${props =>
    props.isDestructive
      ? "0 4px 15px rgba(255, 106, 136, 0.4)"
      : "0 4px 15px rgba(74, 144, 226, 0.4)"};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${props =>
      props.isDestructive
        ? "0 6px 20px rgba(255, 106, 136, 0.5)"
        : "0 6px 20px rgba(74, 144, 226, 0.5)"};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

/**
 * 確認モーダル
 */
export default function ConfirmApplyModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  title,
  body,
  confirmText,
  isDestructive = false,
  showCancel = true,
}) {
  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (!isLoading) onClose();
  };

  let icon = <FaQuestionCircle />;
  let mode = "normal";

  if (isDestructive) {
    icon = <FaExclamationTriangle />;
    mode = "destructive";
  } else if (!showCancel) {
    icon = <FaCheckCircle />;
    mode = "success";
  } else {
    icon = <FaPaperPlane style={{ paddingLeft: "4px" }} />;
    mode = "normal";
  }

  return (
    <ModalBackdrop onClick={handleBackdropClick}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <IconCircle mode={mode}>{icon}</IconCircle>

        <ModalTitle>{title || "確認"}</ModalTitle>
        <ModalBody>{body || "よろしいですか？"}</ModalBody>

        <ModalButtonContainer>
          {showCancel && (
            <CancelButton onClick={onClose} disabled={isLoading}>
              <FaTimes /> 閉じる
            </CancelButton>
          )}

          <ConfirmButton
            onClick={onConfirm}
            disabled={isLoading}
            isDestructive={isDestructive}
          >
            {isLoading ? (
              "送信中..."
            ) : (
              <>
                {!showCancel ? (
                  <FaCheckCircle />
                ) : isDestructive ? (
                  <FaExclamationTriangle />
                ) : (
                  <FaPaperPlane />
                )}
                {confirmText || "OK"}
              </>
            )}
          </ConfirmButton>
        </ModalButtonContainer>
      </ModalContent>
    </ModalBackdrop>
  );
}
