"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    WebChat?: any;
    myChatWidget?: boolean;
    React?: any;
    ReactDOM?: any;
  }
}

export default function ChatWidget() {
  useEffect(() => {
    if (window.myChatWidget) return;
    // Đảm bảo React và ReactDOM global cho UMD
    window.React = require("react");
    window.ReactDOM = require("react-dom");

    const script = document.createElement("script");
    script.src = "/rasa-webchat.js";
    script.async = true;
    script.onload = () => {
      // Tùy file UMD, thử các hàm sau:
      const config = {
        initPayload: "/greet",
        customData: { language: "vi" },
        title: "Trợ lý Rasa",
        subtitle: "Hãy hỏi tôi!",
        inputTextFieldHint: "Nhập câu hỏi...",
        showFullScreenButton: true,
        params: { storage: "local" },
        endpointUrl: "http://localhost:5005/webhooks/rest/webhook",
      };
      if (typeof window.WebChat?.default === "function") {
        window.WebChat.default(config);
      } else if (typeof window.WebChat === "function") {
        window.WebChat(config);
      } else if (typeof window.WebChat?.open === "function") {
        window.WebChat.open(config);
      } else {
        console.error("Không tìm thấy hàm khởi tạo phù hợp trong window.WebChat", window.WebChat);
      }
    };
    document.body.appendChild(script);
    window.myChatWidget = true;
  }, []);

  return null;
}
