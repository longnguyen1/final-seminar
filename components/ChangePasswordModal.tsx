"use client";
import { useState } from "react";

export default function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    setLoading(true);
    await fetch("/api/user/change-password", {
      method: "POST",
      body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
      headers: { "Content-Type": "application/json" },
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="p-6 bg-white rounded shadow-lg w-80">
        <h2 className="mb-4 font-bold">Đổi mật khẩu</h2>
        <input
          className="w-full p-2 mb-2 border"
          type="password"
          placeholder="Mật khẩu cũ"
          value={oldPw}
          onChange={e => setOldPw(e.target.value)}
        />
        <input
          className="w-full p-2 mb-4 border"
          type="password"
          placeholder="Mật khẩu mới"
          value={newPw}
          onChange={e => setNewPw(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2">Hủy</button>
          <button onClick={handleChange} className="px-4 py-2 text-white bg-blue-600" disabled={loading}>
            Đổi mật khẩu
          </button>
        </div>
      </div>
    </div>
  );
}