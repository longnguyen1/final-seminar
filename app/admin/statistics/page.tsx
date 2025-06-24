"use client";

import { useState, useEffect } from "react";
import ChartCard from "./ChartCard";

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
  fetch("/api/statistics")
    .then((res) => {
      if (!res.ok) throw new Error("API failed");
      return res.json();
    })
    .then(setStats)
    .catch((err) => {
      console.error("Lỗi khi fetch statistics:", err);
    });
}, []);


  if (!stats) return <p className="p-4">Đang tải thống kê...</p>;

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">📊 Thống kê chuyên gia</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-2 border-b-2 ${activeTab === "overview" ? "border-blue-600 text-blue-600 font-bold" : "border-transparent"}`}
        >
          Tổng quan
        </button>
        <button
          onClick={() => setActiveTab("organization")}
          className={`pb-2 border-b-2 ${activeTab === "organization" ? "border-blue-600 text-blue-600 font-bold" : "border-transparent"}`}
        >
          Theo đơn vị
        </button>
        <button
          onClick={() => setActiveTab("other")}
          className={`pb-2 border-b-2 ${activeTab === "other" ? "border-blue-600 text-blue-600 font-bold" : "border-transparent"}`}
        >
          Khác
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ChartCard title="Tổng số chuyên gia" data={[{ label: "Total", value: stats.total }]} />
          <ChartCard title="Theo học vị" data={stats.byDegree.map((item: any) => ({
            label: item.degree || "Không rõ",
            value: item._count.degree
          }))} />
        </div>
      )}

      {activeTab === "organization" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ChartCard title="Theo tổ chức" data={stats.byOrganization.map((item: any) => ({
            label: item.organization || "Không rõ",
            value: item._count.organization
          }))} />
        </div>
      )}

      {activeTab === "other" && (
        <div>
          <p>Module mở rộng...</p>
        </div>
      )}
    </div>
  );
}
