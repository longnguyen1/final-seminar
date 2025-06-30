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

    // Đảm bảo global cho UMD
    window.React = require("react");
    window.ReactDOM = require("react-dom");

    const script = document.createElement("script");
    script.src = "/rasa-webchat.js"; // <== dùng file local
    script.async = true;

    script.onload = () => {
      window.WebChat.default({
        initPayload: "/greet",
        customData: { language: "vi" },
        title: "Trợ lý AI",
        subtitle: "Hỏi bất cứ gì!",
        inputTextFieldHint: "Nhập câu hỏi...",
        showFullScreenButton: true,
        params: { storage: "local" },
        socketUrl: "http://localhost:5005",
        socketPath: "/socket.io/",
        onSocketEvent: {
          'user_uttered': (msg: any) => {
            window.localStorage.setItem("lastUserMsg", msg.message);
          },
          'bot_uttered': (msg: any) => {
            const last = window.localStorage.getItem("lastUserMsg");
            if (msg?.text && last) {
              fetch("/api/logs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userMessage: last,
                  botReply: msg.text,
                  source: "rasa"
                })
              });
              window.localStorage.removeItem("lastUserMsg");
            }
          }
        }
      }, null); // mount mặc định
    };

    document.body.appendChild(script);
    window.myChatWidget = true;
  }, []);

  return null;
}
