"use client";

import { useState, useEffect } from "react";
import { createInitialMessages } from "@/lib/openai";
import AIChatPage from "./AIChatPage";

export default function AIChatPageWrapper() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // 初期メッセージを設定
    const initMessages = async () => {
      try {
        const initialMessages = await createInitialMessages();
        setMessages(initialMessages);
      } catch (error) {
        console.error("Error initializing messages:", error);
      }
    };
    initMessages();
  }, []);

  const onSendMessage = async (userMessage) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error("Error in onSendMessage:", error);
      throw error;
    }
  };

  return (
    <AIChatPage
      messages={messages}
      setMessages={setMessages}
      onSendMessage={onSendMessage}
    />
  );
}



