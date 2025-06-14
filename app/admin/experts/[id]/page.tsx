'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ExpertInfoForm from './components/ExpertInfoForm';
import EducationSection from './components/EducationSection';
import WorkHistorySection from './components/WorkHistorySection';
import PublicationSection from './components/PublicationSection';
import ProjectSection from './components/ProjectSection';
import LanguageSection from './components/LanguageSection'; // ✅ thêm dòng này

type Tab = 'info' | 'education' | 'work' | 'publication' | 'project' | 'language'; // ✅ thêm 'language'

export default function ExpertDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [expert, setExpert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExpert() {
      try {
        const res = await fetch(`/api/experts/${id}`);
        if (!res.ok) throw new Error('Không tìm thấy chuyên gia');
        const data = await res.json();
        setExpert(data);
      } catch (err: any) {
        console.error('Lỗi:', err);
        setError(err.message || 'Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchExpert();
  }, [id]);

  if (loading) return <div className="p-8">Đang tải...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!expert) return <div className="p-8 text-red-600">Không tìm thấy chuyên gia</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Tiêu đề và nút quay lại */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{expert.fullName}</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ← Quay lại
        </button>
      </div>

      {/* Tabs điều hướng */}
      <nav className="border-b border-gray-200">
        <ul className="flex space-x-6 text-sm font-medium">
          <li>
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-2 ${activeTab === 'info'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-black'}`}
            >
              📝 Thông tin chung
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('education')}
              className={`pb-2 ${activeTab === 'education'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-black'}`}
            >
              🎓 Học vấn
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('work')}
              className={`pb-2 ${activeTab === 'work'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-black'}`}
            >
              💼 Công tác
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('publication')}
              className={`pb-2 ${activeTab === 'publication'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-black'}`}
            >
              📚 Công trình KH
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('project')}
              className={`pb-2 ${activeTab === 'project'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-black'}`}
            >
              🧪 Đề tài / Dự án
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('language')}
              className={`pb-2 ${activeTab === 'language'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-black'}`}
            >
              🌐 Ngoại ngữ
            </button>
          </li>
        </ul>
      </nav>

      {/* Nội dung tab */}
      <div className="pt-4">
        {activeTab === 'info' && <ExpertInfoForm expert={expert} onSaved={setExpert} />}
        {activeTab === 'education' && <EducationSection expertId={Number(id)} />}
        {activeTab === 'work' && <WorkHistorySection expertId={Number(id)} />}
        {activeTab === 'publication' && <PublicationSection expertId={Number(id)} />}
        {activeTab === 'project' && <ProjectSection expertId={Number(id)} />}
        {activeTab === 'language' && <LanguageSection expertId={Number(id)} />}
      </div>
    </div>
  );
}
