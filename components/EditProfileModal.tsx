"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await fetch("/api/user/update", {
      method: "POST",
      body: JSON.stringify({ name }),
      headers: { "Content-Type": "application/json" },
    });
    await update();
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="p-6 bg-white rounded shadow-lg w-80">
        <h2 className="mb-4 font-bold">Sửa thông tin cá nhân</h2>
        <input
          className="w-full p-2 mb-4 border"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2">Hủy</button>
          <button onClick={handleSave} className="px-4 py-2 text-white bg-blue-600" disabled={loading}>
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}