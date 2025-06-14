'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ExpertFormModal from './ExpertFormModal';

interface Expert {
  id: number;
  fullName: string;
  birthYear: number | null;
  organization: string | null;
}

export default function ExpertTable() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchExperts = async () => {
    const res = await fetch('/api/experts');
    const data = await res.json();
    setExperts(data);
  };

  useEffect(() => {
    fetchExperts();
  }, []);

  const handleAdd = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Admin Dashboard</h1>

      <div className="mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleAdd}
        >
          ➕ Thêm chuyên gia
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full text-sm text-left text-gray-800">
          <thead className="bg-gray-200 text-gray-900 uppercase text-sm font-semibold">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Họ tên</th>
              <th className="px-4 py-2">Năm sinh</th>
              <th className="px-4 py-2">Đơn vị</th>
            </tr>
          </thead>
          <tbody>
            {experts.map((expert, index) => (
              <tr key={expert.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2 text-blue-700 hover:underline">
                  <Link href={`/admin/experts/${expert.id}`}>
                    {expert.fullName}
                  </Link>
                </td>
                <td className="px-4 py-2">{expert.birthYear ?? '-'}</td>
                <td className="px-4 py-2">{expert.organization ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ExpertFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchExperts}
      />
    </div>
  );
}
