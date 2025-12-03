"use client";

/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "../chat/ChatMessage";
import LoadingSpinner from "../chat/LoadingSpinner";
import { getInitialMessages, processChatMessage } from "@/app/search/ai/page";

const container = css`
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem;
  height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
`;

const chatContainer = css`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

const inputContainer = css`
  display: flex;
  gap: 0.5rem;
`;

const inputField = css`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 1px #3182ce;
  }
`;

const button = (isLoading) => css`
  padding: 0.5rem 1rem;
  background-color: #3182ce;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: ${isLoading ? "not-allowed" : "pointer"};
  opacity: ${isLoading ? 0.7 : 1};

  &:hover {
    background-color: ${isLoading ? "#3182ce" : "#2c5282"};
  }
`;

const AIChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const initMessages = async () => {
      try {
        const initialMessages = await getInitialMessages();
        setMessages(initialMessages);
      } catch (error) {
        console.error("Error initializing messages:", error);
      }
    };
    initMessages();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (messageContent = null) => {
    const content = messageContent || inputMessage;
    if (!content || !content.trim()) return;

    const userMessage = {
      role: "user",
      content: content,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    if (!messageContent) {
      setInputMessage("");
    }
    setIsLoading(true);

    try {
      const responseMessage = await processChatMessage(newMessages);
      setMessages((prev) => [...prev, responseMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        role: "assistant",
        content: "エラーが発生しました。メッセージの送信に失敗しました。",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionClick = (option) => {
    handleSendMessage(option);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const displayMessages = messages.filter((msg) => msg.role !== "system");

  return (
    <div css={container}>
      <div css={chatContainer} ref={chatContainerRef}>
        {displayMessages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            isUser={message.role === "user"}
            onOptionClick={handleOptionClick}
          />
        ))}
        {isLoading && <LoadingSpinner />}
      </div>
      <div css={inputContainer}>
        <input
          css={inputField}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="メッセージを入力..."
          disabled={isLoading}
        />
        <button
          css={button(isLoading)}
          onClick={() => handleSendMessage()}
          disabled={isLoading}
        >
          {isLoading ? "送信中..." : "送信"}
        </button>
      </div>
    </div>
  );
};

export default AIChatPage;
