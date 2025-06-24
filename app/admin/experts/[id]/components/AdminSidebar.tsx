"use client";
import Link from "next/link";

export default function AdminSidebar() {
  return (
    <aside className="flex flex-col w-64 h-screen p-4 bg-base-200">
      <h2 className="mb-6 text-lg font-bold">Admin Menu</h2>
      <ul className="flex flex-col gap-2">
        <li>
          <Link href="/admin" className="link link-hover">
            📊 Dashboard
          </Link>
        </li>
        <li>
          <Link href="/admin/experts" className="link link-hover">
            👨‍🎓 Quản lý Experts
          </Link>
        </li>
      </ul>
    </aside>
  );
}
