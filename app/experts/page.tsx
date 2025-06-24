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
  const [degreeOptions, setDegreeOptions] = useState<string[]>([]);
  const [orgOptions, setOrgOptions] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const { theme, toggleTheme } = useTheme();

  // ✅ Fetch gợi ý Degree & Org
  const fetchOptions = async () => {
    const res = await fetch(`/api/experts/options`);
    const data = await res.json();
    setDegreeOptions(data.degrees);
    setOrgOptions(data.organizations);
  };

  const fetchData = async () => {
    const query = new URLSearchParams({
      name,
      degree,
      org,
      page: page.toString()
    }).toString();
    const res = await fetch(`/api/experts/search?${query}`);
    const data = await res.json();
    setExperts(data);
  };

  useEffect(() => {
    fetchOptions();
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setPage(1); // Reset về page 1
    fetchData();
  };

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
          <input
            placeholder="Họ tên..."
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full input input-bordered md:w-auto"
          />

          <select
            value={degree}
            onChange={e => setDegree(e.target.value)}
            className="w-full input input-bordered md:w-auto"
          >
            <option value="">🎓 Tất cả học vị</option>
            {degreeOptions.map((deg) => (
              <option key={deg} value={deg}>{deg}</option>
            ))}
          </select>

          <select
            value={org}
            onChange={e => setOrg(e.target.value)}
            className="w-full input input-bordered md:w-auto"
          >
            <option value="">🏢 Tất cả đơn vị</option>
            {orgOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>

          <button type="submit" className="btn btn-primary">🔍 Tìm kiếm</button>
        </form>
      </div>

      <ExpertPublicTable experts={experts} page={page} setPage={setPage} />
    </main>
  );
}
