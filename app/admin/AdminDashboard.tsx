"use client";

import React from "react";
import { useState } from "react";
import ExpertTable from "./experts/ExpertTable";
import StatisticsPage from "./statistics/page";
import AdminSettingsMenu from "../components/AdminSettingsMenu";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"experts" | "statistics">("experts");

  return (
    <div className="p-8">
      <div className="relative">
        <h1 className="mb-4 text-2xl font-bold">Admin Dashboard</h1>
        <div className="absolute top-4 right-4">
          <AdminSettingsMenu />
        </div>
      </div>
      <div className="flex mt-4 mb-6 space-x-4">
        <button
          onClick={() => setActiveTab("experts")}
          className={`pb-2 border-b-2 ${activeTab === "experts" ? "border-blue-600 text-blue-600 font-bold" : "border-transparent"}`}
        >
          👨‍💼 Chuyên gia
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
