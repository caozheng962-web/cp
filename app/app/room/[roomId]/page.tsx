'use client';

import { useState, useEffect, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LIVE_ROOMS } from '@/lib/mockData';
import { Evaluation, LiveRoom } from '@/lib/types';
import { useEvaluatorInfo } from '@/lib/hooks';
import { SkuList } from '@/app/components/SkuList';
import { Modal } from '@/app/components/Modal';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const { evaluatorId } = useEvaluatorInfo();
  
  const room = LIVE_ROOMS.find(r => r.id === roomId);
  
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [currentSkuId, setCurrentSkuId] = useState<string | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (evaluatorId) {
      fetchEvaluations();
    }
  }, [evaluatorId, roomId]);

  const fetchEvaluations = async () => {
    try {
      const res = await fetch('/api/evaluations');
      const data = await res.json();
      // Filter logic can be here or API side. API returns all for now.
      // We filter for this room and this user.
      const myEvaluations = data.filter((e: Evaluation) => 
        e.roomId === roomId && e.evaluatorId === evaluatorId
      );
      setEvaluations(myEvaluations);
    } catch (err) {
      console.error('Failed to fetch evaluations', err);
    }
  };

  const handleSaveEvaluation = async (evaluation: Evaluation) => {
    const res = await fetch('/api/evaluations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evaluation),
    });
    
    if (res.ok) {
      // Refresh local state optimistically or re-fetch
      setEvaluations(prev => {
        const idx = prev.findIndex(e => e.skuId === evaluation.skuId);
        if (idx !== -1) {
          const newArr = [...prev];
          newArr[idx] = evaluation;
          return newArr;
        }
        return [...prev, evaluation];
      });
    } else {
      throw new Error('Save failed');
    }
  };

  const checkCompletion = () => {
    if (!room) return false;
    return room.skus.every(sku => 
      evaluations.some(e => e.skuId === sku.id && e.evaluatorId === evaluatorId)
    );
  };

  const handleSubmitAll = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          evaluatorId,
          submittedAt: Date.now()
        })
      });
      
      if (res.ok) {
        setShowSubmitConfirm(false);
        setShowSuccessModal(true);
      }
    } catch (err) {
      alert('提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!room) {
    return <div className="p-8 text-center">直播间不存在</div>;
  }

  const isComplete = checkCompletion();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{room.name} - KT 板评测</h1>
        </div>
        <div className="text-sm text-gray-500">
          已评测: {evaluations.length} / {room.skus.length}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 flex gap-6 overflow-hidden h-[calc(100vh-64px-80px)]">
        {/* Left: Video */}
        <div className="flex-1 bg-black rounded-xl overflow-hidden shadow-lg flex items-center justify-center relative max-h-[calc(100vh-160px)]">
          <video 
            src={room.videoUrl} 
            controls 
            className="w-full h-full object-contain"
            poster="/video-placeholder.png" // Optional
          >
            您的浏览器不支持视频播放。
          </video>
        </div>

        {/* Right: SKU List */}
        <div className="w-[450px] flex-shrink-0 flex flex-col">
          <SkuList 
            room={room}
            evaluations={evaluations}
            currentSkuId={currentSkuId}
            setCurrentSkuId={setCurrentSkuId}
            onSaveEvaluation={handleSaveEvaluation}
            evaluatorId={evaluatorId || ''}
          />
        </div>
      </main>

      {/* Footer: Submit Button */}
      <footer className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-10 flex justify-center">
        <button
          onClick={() => setShowSubmitConfirm(true)}
          disabled={!isComplete}
          className={`
            w-full max-w-md py-3 px-6 rounded-lg font-bold text-lg transition-all
            ${isComplete 
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg transform hover:-translate-y-0.5' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isComplete ? '提交本直播间全部评测' : '还有未评测的 SKU，请完成所有 SKU 评测后再提交'}
        </button>
      </footer>

      {/* Submit Confirm Modal */}
      <Modal 
        isOpen={showSubmitConfirm} 
        onClose={() => setShowSubmitConfirm(false)}
        title="提交确认"
      >
        <div className="space-y-6">
          <p className="text-gray-600">确认提交本直播间所有 SKU 的评测结果？提交后仍可返回本页修改。</p>
          <div className="flex gap-4 justify-end">
            <button 
              onClick={() => setShowSubmitConfirm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button 
              onClick={handleSubmitAll}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isSubmitting ? '提交中...' : '确认提交'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        title="已提交完成"
      >
        <div className="space-y-6 text-center">
          <div className="flex justify-center mb-4">
             <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <p className="text-gray-600 text-lg">本直播间的评测已提交完成，感谢您的评测！</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => router.push('/')}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium"
            >
              返回首页
            </button>
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
            >
              继续查看本直播间（可修改）
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
