"use client";

import { useState } from "react";
import ExpertTable from "./experts/ExpertTable";
import StatisticsPage from "./statistics/page";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"experts" | "statistics">("experts");

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Admin Dashboard</h1>

      <div className="flex gap-4 mb-4 border-b">
        <button
          onClick={() => setActiveTab("experts")}
          className={`pb-2 border-b-2 ${activeTab === "experts" ? "border-blue-600 text-blue-600 font-bold" : "border-transparent"}`}
        >
          📋 Danh sách chuyên gia
        </button>
        <button
          onClick={() => setActiveTab("statistics")}
          className={`pb-2 border-b-2 ${activeTab === "statistics" ? "border-blue-600 text-blue-600 font-bold" : "border-transparent"}`}
        >
          📊 Thống kê
        </button>
      </div>

      {activeTab === "experts" && <ExpertTable />}
      {activeTab === "statistics" && <StatisticsPage />}
    </div>
  );
}
