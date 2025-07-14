'use client';
import React, { useState } from 'react';
import ChatBox from './ChatBox';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Nút biểu tượng chat cố định */}
      <div
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1000,
        }}
      >
        {!open && (
          <button
            onClick={() => setOpen(true)}
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              fontSize: 32,
              cursor: 'pointer',
            }}
            aria-label="Mở chat"
            title="Mở chat"
          >
            💬
          </button>
        )}
      </div>
      {/* Khung chat nổi */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1001,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
            width: 520,
            maxWidth: '95vw',
            height: '90vh', // Thêm dòng này để khung chat luôn vừa màn hình
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 4 }}>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                color: '#888',
              }}
              aria-label="Đóng chat"
              title="Đóng chat"
            >
              ❌
            </button>
          </div>
          <ChatBox />
        </div>
      )}
    </>
  );
}