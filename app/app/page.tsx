'use client';

import Link from 'next/link';
import { LIVE_ROOMS } from '@/lib/mockData';
import { ArrowRight, BarChart2, User } from 'lucide-react';
import { useEvaluatorInfo } from '@/lib/hooks';
import { LoginModal } from '@/app/components/LoginModal';
import { useEffect, useState } from 'react';

export default function Home() {
  const { evaluatorId, isLoaded, login, logout } = useEvaluatorInfo();
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    if (evaluatorId) {
      fetch(`/api/stats?evaluatorId=${encodeURIComponent(evaluatorId)}`)
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error('Failed to fetch stats', err));
    } else {
      // Clear stats if no user logged in
      setStats({});
    }
  }, [evaluatorId]);

  return (
    <main className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-12">
        <header className="text-center space-y-4 relative">
          <h1 className="text-4xl font-bold text-gray-900">直播间 KT 板在线测评工具</h1>
          <p className="text-gray-500">请选择直播间开始评测，或查看数据表现</p>
          
          {evaluatorId && (
            <div className="absolute top-0 right-0 flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{evaluatorId}</span>
              </div>
              <button onClick={logout} className="text-blue-600 hover:underline">退出</button>
            </div>
          )}
        </header>

        <section className="grid md:grid-cols-2 gap-6">
          {LIVE_ROOMS.map((room) => (
            <div 
              key={room.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{room.name}</h2>
                <div className="space-y-1 mb-6 text-gray-500">
                  <p>共 {room.skus.length} 个 SKU</p>
                  <p className="font-medium text-blue-600">已完成评测：{stats[room.id] || 0} 次</p>
                </div>
              </div>
              <Link 
                href={`/room/${room.id}`}
                className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                进入评测
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          ))}
        </section>

      </div>

      <LoginModal 
        isOpen={isLoaded && !evaluatorId} 
        onLogin={login} 
      />
    </main>
  );
}
