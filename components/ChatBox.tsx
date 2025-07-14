'use client';
import React, { useState, useRef, useEffect } from 'react';

const STORAGE_KEY = 'rasa_chat_history';

const INTRO_MESSAGES = [
  { from: 'bot', text: '🤖 Xin chào! Tôi là trợ lý AI tra cứu chuyên gia.' },
  { from: 'bot', text: 'Bạn có thể hỏi về thông tin chuyên gia, quá trình đào tạo, công trình khoa học, dự án, ngoại ngữ...' },
];

export default function ChatBox() {
  const [messages, setMessages] = useState<{from: string, text: string}[]>(() => {
    // Lấy lịch sử từ localStorage khi khởi tạo
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      return INTRO_MESSAGES;
    }
    return INTRO_MESSAGES;
  });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { from: 'user', text: input }]);
    setInput('');
    const res = await fetch('http://localhost:5005/webhooks/rest/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: 'test-user', message: input })
    });
    const data = await res.json();
    data.forEach((msg: any) => {
      setMessages(prev => [...prev, { from: 'bot', text: msg.text }]);
    });
  };

  // Lưu lịch sử vào localStorage mỗi khi messages thay đổi
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      boxSizing: 'border-box',
      border: '1px solid #ccc',
      borderRadius: 8,
      background: '#fff',
    }}
  >
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        background: '#fafafa',
        padding: 16,
      }}
    >
      {messages.map((msg, idx) => (
        <div
          key={idx}
          style={{
            textAlign: msg.from === 'user' ? 'right' : 'left',
            whiteSpace: 'pre-line',
            margin: '8px 0'
          }}
        >
          <b>{msg.from === 'user' ? 'Bạn' : 'Bot'}:</b> {msg.text}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: 12,
      borderTop: '1px solid #eee',
      background: '#fff'
    }}>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && sendMessage()}
        placeholder="Nhập tin nhắn..."
        style={{ width: '80%', marginRight: 8, fontSize: 18, padding: 8 }}
      />
      <button onClick={sendMessage} style={{ fontSize: 18, padding: '8px 16px' }}>Gửi</button>
    </div>
  </div>
);
}