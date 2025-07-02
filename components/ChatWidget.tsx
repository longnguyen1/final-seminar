"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    WebChat?: any;
  }
}

export default function ChatWidget() {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Tránh load script nhiều lần
    if (scriptLoaded.current) return;
    
    const script = document.createElement("script");
    script.id = "rasa-webchat";
    script.src = "/rasa-webchat.js"; // Đảm bảo tên file khớp với file trong /public
    script.async = true;

    script.onload = () => {
      if (window.WebChat && !document.querySelector(".rw-conversation-container")) {
        window.WebChat.default({
          initPayload: "/greet",
          customData: { language: "vi" },
          title: "Hỏi chuyên gia AI",
          subtitle: "Chatbot hỗ trợ tra cứu chuyên gia",
          inputTextFieldHint: "Nhập câu hỏi...",
          showFullScreenButton: true,
          profileAvatar: "/avatar.png",
          embedded: true,
          // Tắt WebSocket và cấu hình REST
          useSocket: false,
          socketUrl: null,
          host: "http://localhost:5005/webhooks/rest/webhook",
          docViewer: false,
          // Cấu hình lưu trữ và hiệu suất
          params: {
            storage: "local",
            userId: `user_${Date.now()}`,
            cacheKey: "webchat_data",
          },
          // Xử lý lỗi
          showMessageDate: true,
          handleError: (error: any) => {
            console.warn("Webchat error:", error);
          },
        });
      }
    };

    script.onerror = (error) => {
      console.error("Error loading webchat script:", error);
    };

    document.body.appendChild(script);
    scriptLoaded.current = true;

    // Cleanup khi unmount
    return () => {
      const existingScript = document.getElementById("rasa-webchat");
      if (existingScript) {
        existingScript.remove();
      }
      const widget = document.querySelector(".rw-conversation-container");
      if (widget) {
        widget.remove();
      }
    };
  }, []);

  return (
    <div 
      id="webchat" 
      className="fixed bottom-4 right-4 z-50 w-[370px] h-[500px] shadow-lg rounded-lg"
      aria-label="Chat with AI Expert"
    />
  );
}
