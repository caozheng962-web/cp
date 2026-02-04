'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OverviewTab, SkuDetailsTab, ProblemDistributionTab } from '@/app/components/DashboardComponents';
import { Modal } from '@/app/components/Modal';
import { Evaluation } from '@/lib/types';
import clsx from 'clsx';
import { LogOut, Trash2, Users, BarChart2 } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'evaluators' | 'dashboard'>('evaluators');
  const [loading, setLoading] = useState(true);
  
  // Dashboard Data
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  
  // Evaluators Data
  const [evaluatorsList, setEvaluatorsList] = useState<any[]>([]);

  // Clear Data Modal
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    // Simple auth check
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/');
      return;
    }

    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/evaluations?submittedOnly=true').then(res => res.json()),
      fetch('/api/admin/evaluators').then(res => res.json())
    ]).then(([evalData, evaluatorsData]) => {
      setEvaluations(evalData);
      setEvaluatorsList(evaluatorsData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/');
  };

  const handleClearData = async () => {
    if (clearConfirmText !== '确认清空') return;
    
    setIsClearing(true);
    try {
      const res = await fetch('/api/admin/clear', { method: 'POST' });
      if (res.ok) {
        alert('已成功清空所有评测记录。');
        setShowClearModal(false);
        setClearConfirmText('');
        loadData(); // Refresh data (should be empty)
      } else {
        alert('清空失败');
      }
    } catch (e) {
      alert('清空失败');
    } finally {
      setIsClearing(false);
    }
  };

  if (loading) return <div className="p-8 text-center">加载管理员界面...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">管理员后台</h1>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          退出管理员
        </button>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation & Actions */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('evaluators')}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                activeTab === 'evaluators' ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Users className="w-5 h-5" />
              评测人员列表
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                activeTab === 'dashboard' ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <BarChart2 className="w-5 h-5" />
              数据看板
            </button>
          </div>

          <button
            onClick={() => setShowClearModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 transition-colors font-medium"
          >
            <Trash2 className="w-5 h-5" />
            清空所有评测记录
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px] p-6">
          {activeTab === 'evaluators' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800">评测人员完成情况</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">事业部</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">已完成评测次数</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">已评测直播间</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最近一次提交时间</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {evaluatorsList.map((ev) => (
                      <tr key={ev.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">{ev.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{ev.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">{ev.completedCount}</td>
                        <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate" title={ev.rooms.join(' / ')}>
                          {ev.rooms.join(' / ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {new Date(ev.lastSubmission).toLocaleString('zh-CN')}
                        </td>
                      </tr>
                    ))}
                    {evaluatorsList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">暂无评测记录</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="h-full flex flex-col">
              {/* Reuse dashboard tabs component logic, slightly adapted since we want the tabs inside this container 
                  or we can just render the components directly. 
                  Let's use the DashboardTabs component I extracted if possible, or just build the UI here.
                  Actually, I extracted individual tabs. I'll build a mini-tab system here for the dashboard internal tabs.
              */}
              <DashboardInternal evaluations={evaluations} />
            </div>
          )}
        </div>
      </div>

      {/* Clear Data Confirmation Modal */}
      <Modal 
        isOpen={showClearModal} 
        onClose={() => setShowClearModal(false)} 
        title="确认清空所有评测记录？"
      >
        <div className="space-y-4">
          <p className="text-red-600 font-medium">
            该操作会清除所有评测员的评测记录和提交记录，数据看板统计也会被清空。操作不可撤销，请谨慎操作。
          </p>
          <p className="text-gray-600 text-sm">
            请输入 <strong>确认清空</strong> 以继续。
          </p>
          <input 
            type="text" 
            value={clearConfirmText}
            onChange={(e) => setClearConfirmText(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
            placeholder="确认清空"
          />
          <div className="flex gap-3 justify-end pt-2">
            <button 
              onClick={() => setShowClearModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button 
              onClick={handleClearData}
              disabled={isClearing || clearConfirmText !== '确认清空'}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClearing ? '清空中...' : '确认清空'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function DashboardInternal({ evaluations }: { evaluations: Evaluation[] }) {
  const [subTab, setSubTab] = useState<'overview' | 'sku' | 'problem'>('overview');

  return (
    <div>
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setSubTab('overview')}
          className={clsx("px-6 py-3 font-medium text-sm border-b-2 transition-colors", subTab === 'overview' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700")}
        >
          直播间总览
        </button>
        <button
          onClick={() => setSubTab('sku')}
          className={clsx("px-6 py-3 font-medium text-sm border-b-2 transition-colors", subTab === 'sku' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700")}
        >
          SKU 明细
        </button>
        <button
          onClick={() => setSubTab('problem')}
          className={clsx("px-6 py-3 font-medium text-sm border-b-2 transition-colors", subTab === 'problem' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700")}
        >
          问题类型分布
        </button>
      </div>
      <div>
        {subTab === 'overview' && <OverviewTab evaluations={evaluations} />}
        {subTab === 'sku' && <SkuDetailsTab evaluations={evaluations} />}
        {subTab === 'problem' && <ProblemDistributionTab evaluations={evaluations} />}
      </div>
    </div>
  );
}
