'use client';

import { useState, useEffect } from 'react';
import { LIVE_ROOMS, ISSUE_OPTIONS } from '@/lib/mockData';
import { Evaluation } from '@/lib/types';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'sku' | 'problem'>('overview');
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

      <main className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px] flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            直播间总览
          </TabButton>
          <TabButton active={activeTab === 'sku'} onClick={() => setActiveTab('sku')}>
            SKU 明细
          </TabButton>
          <TabButton active={activeTab === 'problem'} onClick={() => setActiveTab('problem')}>
            问题类型分布
          </TabButton>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-auto">
          {activeTab === 'overview' && <OverviewTab evaluations={evaluations} />}
          {activeTab === 'sku' && <SkuDetailsTab evaluations={evaluations} />}
          {activeTab === 'problem' && <ProblemDistributionTab evaluations={evaluations} />}
        </div>
      </main>
    </div>
  );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-6 py-4 font-medium text-sm transition-colors border-b-2",
        active 
          ? "border-blue-600 text-blue-600" 
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      )}
    >
      {children}
    </button>
  );
}

function OverviewTab({ evaluations }: { evaluations: Evaluation[] }) {
  const stats = LIVE_ROOMS.map(room => {
    const roomEvals = evaluations.filter(e => e.roomId === room.id);
    const total = roomEvals.length;
    if (total === 0) return null;

    const videoQualified = roomEvals.filter(e => e.videoQualified === 'qualified').length;
    const visualQualified = roomEvals.filter(e => e.visualQualified === 'qualified').length;
    const totalBoardCount = roomEvals.reduce((acc, e) => acc + e.boardAppearanceCount, 0);
    
    // Issue counts
    const issuesCount: Record<string, number> = {};
    roomEvals.forEach(e => {
      e.issues?.forEach(issue => {
        issuesCount[issue] = (issuesCount[issue] || 0) + 1;
      });
    });

    return {
      id: room.id,
      name: room.name,
      skuCount: room.skus.length,
      evalCount: total,
      videoQualifiedRate: (videoQualified / total * 100).toFixed(1) + '%',
      visualQualifiedRate: (visualQualified / total * 100).toFixed(1) + '%',
      avgBoardCount: (totalBoardCount / total).toFixed(1),
      // Example issue rate: mismatch
      mismatchRate: ((issuesCount['mismatch'] || 0) / total * 100).toFixed(1) + '%',
    };
  }).filter(Boolean);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">核心指标对比</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">直播间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU 数</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评测总次数</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">视频合格率</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KT 板视觉合格率</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均 KT 板出现次数</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">图文不匹配占比</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stats.map((row: any) => (
              <tr key={row.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{row.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{row.skuCount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{row.evalCount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{row.videoQualifiedRate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{row.visualQualifiedRate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{row.avgBoardCount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{row.mismatchRate}</td>
              </tr>
            ))}
            {stats.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">暂无数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SkuDetailsTab({ evaluations }: { evaluations: Evaluation[] }) {
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');

  const filteredEvals = evaluations.filter(e => selectedRoomId === 'all' || e.roomId === selectedRoomId);

  // Group by SKU
  const skuStatsMap = new Map<string, any>();

  filteredEvals.forEach(e => {
    const key = e.skuId;
    if (!skuStatsMap.has(key)) {
      // Find SKU info
      let skuInfo = null;
      let roomName = '';
      for (const r of LIVE_ROOMS) {
        const found = r.skus.find(s => s.id === e.skuId);
        if (found) {
          skuInfo = found;
          roomName = r.name;
          break;
        }
      }
      if (!skuInfo) return;

      skuStatsMap.set(key, {
        id: key,
        name: skuInfo.name,
        price: skuInfo.price,
        roomName,
        total: 0,
        videoQualified: 0,
        visualQualified: 0,
        boardCount: 0,
        issues: {} as Record<string, number>,
      });
    }

    const stat = skuStatsMap.get(key);
    stat.total++;
    if (e.videoQualified === 'qualified') stat.videoQualified++;
    if (e.visualQualified === 'qualified') stat.visualQualified++;
    stat.boardCount += e.boardAppearanceCount;
    e.issues?.forEach(i => {
      stat.issues[i] = (stat.issues[i] || 0) + 1;
    });
  });

  const skuStats = Array.from(skuStatsMap.values());

  const exportToCsv = () => {
    const headers = ['SKU名称', '直播间', '价格', '评测次数', '视频合格率', 'KT板合格率', '总KT板出现次数', ...ISSUE_OPTIONS.map(i => i.label)];
    const rows = skuStats.map(s => [
      s.name,
      s.roomName,
      s.price,
      s.total,
      (s.videoQualified / s.total * 100).toFixed(0) + '%',
      (s.visualQualified / s.total * 100).toFixed(0) + '%',
      s.boardCount,
      ...ISSUE_OPTIONS.map(i => s.issues[i.id] || 0)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sku_evaluation_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <select 
          className="border border-gray-300 rounded-lg p-2"
          value={selectedRoomId}
          onChange={(e) => setSelectedRoomId(e.target.value)}
        >
          <option value="all">所有直播间</option>
          {LIVE_ROOMS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <button 
          onClick={exportToCsv}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <Download className="w-4 h-4" />
          导出表格
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">SKU 名称</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">直播间</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">价格</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">评测数</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">视频合格率</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">KT板合格率</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">总KT板数</th>
              {ISSUE_OPTIONS.slice(0, 3).map(opt => (
                <th key={opt.id} className="px-4 py-3 text-left font-medium text-gray-500">{opt.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {skuStats.map((row: any) => (
              <tr key={row.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                <td className="px-4 py-3 text-gray-500">{row.roomName}</td>
                <td className="px-4 py-3 text-gray-500">{row.price}</td>
                <td className="px-4 py-3 text-gray-500">{row.total}</td>
                <td className="px-4 py-3 text-gray-900">{(row.videoQualified / row.total * 100).toFixed(0)}%</td>
                <td className="px-4 py-3 text-gray-900">{(row.visualQualified / row.total * 100).toFixed(0)}%</td>
                <td className="px-4 py-3 text-gray-900">{row.boardCount}</td>
                {ISSUE_OPTIONS.slice(0, 3).map(opt => (
                  <td key={opt.id} className="px-4 py-3 text-gray-500">{row.issues[opt.id] || 0}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProblemDistributionTab({ evaluations }: { evaluations: Evaluation[] }) {
  const totalEvals = evaluations.length;
  if (totalEvals === 0) return <div>暂无数据</div>;

  const stats = ISSUE_OPTIONS.map(opt => {
    const count = evaluations.filter(e => e.issues?.includes(opt.id)).length;
    
    // Find room with most issues of this type
    const roomCounts: Record<string, number> = {};
    evaluations.forEach(e => {
      if (e.issues?.includes(opt.id)) {
        roomCounts[e.roomId] = (roomCounts[e.roomId] || 0) + 1;
      }
    });
    
    let maxRoomId = '';
    let maxCount = 0;
    Object.entries(roomCounts).forEach(([rid, c]) => {
      if (c > maxCount) {
        maxCount = c;
        maxRoomId = rid;
      }
    });

    const roomName = LIVE_ROOMS.find(r => r.id === maxRoomId)?.name || '-';

    return {
      id: opt.id,
      label: opt.label,
      count,
      percentage: (count / totalEvals * 100).toFixed(1) + '%',
      topRoom: roomName,
    };
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">问题类型分布</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">问题类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">总次数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">总占比</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">问题最多的直播间</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.map((row) => (
                <tr key={row.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.label}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.percentage}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.topRoom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Simple Bar Chart (CSS based) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium mb-4">问题占比可视化</h3>
          <div className="space-y-4">
            {stats.map(row => (
              <div key={row.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{row.label}</span>
                  <span className="text-gray-500">{row.percentage}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: row.percentage }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
