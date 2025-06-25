"use client";
import React from "react";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";

export default function AdminSettingsMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);

  return (
    <div className="relative">
      <button
        className="w-10 h-10 overflow-hidden border-2 border-gray-300 rounded-full"
        onClick={() => setOpen((v) => !v)}
      >
        <img src={session?.user?.image || "/default-avatar.png"} alt="avatar" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 w-64 p-4 mt-2 bg-white rounded-lg shadow-lg">
          <div className="mb-2 font-semibold">{session?.user?.name}</div>
          <div className="mb-4 text-sm text-gray-500">{session?.user?.email}</div>
          <button
            className="w-full py-2 text-left rounded hover:bg-gray-100"
            onClick={() => { setShowEdit(true); setOpen(false); }}
          >
            Sửa thông tin cá nhân
          </button>
          <button
            className="w-full py-2 text-left rounded hover:bg-gray-100"
            onClick={() => { setShowChangePw(true); setOpen(false); }}
          >
            Đổi mật khẩu
          </button>
          <button
            className="w-full py-2 text-left text-red-600 rounded hover:bg-gray-100"
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          >
            Đăng xuất
          </button>
        </div>
      )}
      {showEdit && <EditProfileModal onClose={() => setShowEdit(false)} />}
      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
    </div>
  );
}