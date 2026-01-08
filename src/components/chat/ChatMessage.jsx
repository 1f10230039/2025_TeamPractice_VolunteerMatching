/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import React from "react";
import ReactMarkdown from "react-markdown";
import EventCard from "../events/EventsCard";

// --- Emotion Styles ---
// メッセージ全体のコンテナ
const messageContainer = css`
  display: flex;
  width: 100%;
  margin-bottom: 1rem;
`;

// メッセージボックスのスタイル（ユーザー・AIで色分け）
const messageBox = isUser => css`
  display: flex;
  flex-direction: column;
  max-width: 80%;
  background-color: ${isUser ? "#e3f2fd" : "#f5f5f5"};
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-left: ${isUser ? "auto" : "0"};
  margin-right: ${isUser ? "0" : "auto"};
`;

// メッセージテキストのスタイル
const messageText = css`
  color: var(--foreground);

  a {
    color: #3182ce;
    text-decoration: underline;
  }

  ul,
  ol {
    padding-left: 1.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }

  li {
    margin-bottom: 0.25rem;
  }
`;

// イベントカードをグリッド表示するスタイル
const eventCardWrapper = css`
  margin-top: 0.5rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// オプションボタンのコンテナ
const optionsContainer = css`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

// オプションボタンのスタイル
const optionButton = css`
  padding: 0.75rem 1rem;
  background-color: #ffffff;
  border: 2px solid #3182ce;
  border-radius: 0.5rem;
  color: #3182ce;
  cursor: pointer;
  text-align: left;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    background-color: #3182ce;
    color: white;
  }

  &:active {
    transform: scale(0.98);
  }
`;

// --- ChatMessage Component ---
// チャットメッセージコンポーネント
const ChatMessage = ({ message, isUser, onOptionClick }) => {
  // イベントデータやオプションの有無をチェック
  const hasEventData =
    message.eventData && Object.keys(message.eventData).length > 0;
  const hasEvents =
    message.events &&
    Array.isArray(message.events) &&
    message.events.length > 0;
  const hasOptions =
    message.options &&
    Array.isArray(message.options) &&
    message.options.length > 0;

  // コンポーネントの描画
  return (
    <div css={messageContainer}>
      <div css={messageBox(isUser)}>
        <div css={messageText}>
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        {/* 複数のイベントを表示 */}
        {hasEvents && (
          <div css={eventCardWrapper}>
            {message.events.map((event, index) => (
              <EventCard key={event.id || index} event={event} />
            ))}
          </div>
        )}
        {/* 単一のイベントを表示（後方互換性のため） */}
        {!hasEvents && hasEventData && (
          <div css={eventCardWrapper}>
            <EventCard event={message.eventData} />
          </div>
        )}
        {hasOptions && !isUser && (
          <div css={optionsContainer}>
            {message.options.map((option, index) => (
              <button
                key={index}
                css={optionButton}
                onClick={() => onOptionClick && onOptionClick(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
