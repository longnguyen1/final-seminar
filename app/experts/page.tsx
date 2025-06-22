"use client";

import { useState, useEffect } from "react";
import ExpertPublicTable from "./ExpertPublicTable";
import { ThemeProvider, useTheme } from "@/lib/context/ThemeContext";

export default function PublicSearchPageWrapper() {
  return (
    <ThemeProvider>
      <PublicSearchPage />
    </ThemeProvider>
  );
}

function PublicSearchPage() {
  const [name, setName] = useState("");
  const [degree, setDegree] = useState("");
  const [org, setOrg] = useState("");
  const [experts, setExperts] = useState([]);
  const { theme, toggleTheme } = useTheme();

  const fetchData = async () => {
    const query = new URLSearchParams({ name, degree, org }).toString();
    const res = await fetch(`/api/experts/search?${query}`);
    const data = await res.json();
    setExperts(data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = (e: any) => { e.preventDefault(); fetchData(); };

  return (
    <main className="min-h-screen p-8 bg-base-100 text-base-content">
      <div className="flex justify-between mb-4">
        <h1 className="text-3xl font-bold">Tra cứu Chuyên gia</h1>
        <button onClick={toggleTheme} className="btn btn-outline">
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>

      <div className="p-6 mb-6 rounded hero bg-base-200">
        <form onSubmit={handleSubmit} className="flex flex-col justify-center w-full gap-4 md:flex-row">
          <input placeholder="Họ tên..." value={name} onChange={e => setName(e.target.value)} className="w-full input input-bordered md:w-auto" />
          <input placeholder="Học vị..." value={degree} onChange={e => setDegree(e.target.value)} className="w-full input input-bordered md:w-auto" />
          <input placeholder="Đơn vị..." value={org} onChange={e => setOrg(e.target.value)} className="w-full input input-bordered md:w-auto" />
          <button type="submit" className="btn btn-primary">Tìm kiếm</button>
        </form>
      </div>

      <ExpertPublicTable experts={experts} />
    </main>
  );
}
