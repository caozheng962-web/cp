'use client';

import { useState, useEffect } from 'react';
import { Evaluation } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { DashboardTabs } from '@/app/components/DashboardComponents';

export default function DashboardPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/evaluations?submittedOnly=true')
      .then(res => res.json())
      .then(data => {
        setEvaluations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center">加载数据中...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">数据看板</h1>
        </div>
        <div className="text-sm text-gray-500">
          共收到 {evaluations.length} 条评测记录
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <DashboardTabs evaluations={evaluations} />
      </main>
    </div>
  );
}
