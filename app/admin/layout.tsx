import React from "react";
import AdminSidebar from "@/app/admin/experts/[id]/components/AdminSidebar";
import { ToastProvider } from "@/lib/context/ToastContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-6 bg-gray-100">{children}</main>
      </div>
    </ToastProvider>
  );
}
