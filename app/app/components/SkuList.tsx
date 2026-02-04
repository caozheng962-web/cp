import { useState } from 'react';
import { LiveRoom, Evaluation } from '@/lib/types';
import { EvaluationForm } from './EvaluationForm';
import { ChevronDown, ChevronUp, CheckCircle, Circle, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface SkuListProps {
  room: LiveRoom;
  evaluations: Evaluation[];
  currentSkuId: string | null;
  setCurrentSkuId: (id: string | null) => void;
  onSaveEvaluation: (evaluation: Evaluation) => Promise<void>;
  evaluatorId: string;
}

const PAGE_SIZE = 5;

export function SkuList({ 
  room, 
  evaluations, 
  currentSkuId, 
  setCurrentSkuId, 
  onSaveEvaluation,
  evaluatorId
}: SkuListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalSkus = room.skus.length;
  const totalPages = Math.ceil(totalSkus / PAGE_SIZE);
  
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentSkus = room.skus.slice(startIndex, endIndex);

  const isEvaluated = (skuId: string) => {
    return evaluations.some(e => e.skuId === skuId && e.evaluatorId === evaluatorId);
  };

  const getEvaluation = (skuId: string) => {
    return evaluations.find(e => e.skuId === skuId && e.evaluatorId === evaluatorId);
  };

  // Calculate progress for current page
  const evaluatedCountOnPage = currentSkus.filter(sku => isEvaluated(sku.id)).length;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    // Optionally close expanded item when changing pages to keep view clean? 
    // Or we can keep it open if the user comes back. 
    // The requirement says "When user returns to a page... click expand... show content".
    // So we don't need to force collapse, but since the item isn't rendered, it effectively 'hides'.
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <div className="font-bold text-lg">
          SKU 列表
        </div>
        <div className="text-sm text-gray-500">
          共 {totalSkus} 个
        </div>
      </div>

      {/* Page Info Header (Optional per requirements, but good for UX) */}
      <div className="bg-blue-50 px-4 py-2 text-xs text-blue-700 flex justify-between items-center border-b border-blue-100">
        <span>第 {currentPage} 页 / 共 {totalPages} 页</span>
        <span>本页已评测: {evaluatedCountOnPage} / {currentSkus.length}</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {currentSkus.map((sku) => {
          const evaluated = isEvaluated(sku.id);
          const isExpanded = currentSkuId === sku.id;

          return (
            <div key={sku.id} className="border-b border-gray-100 last:border-0">
              <div 
                className={clsx(
                  "p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between",
                  isExpanded && "bg-blue-50 hover:bg-blue-50"
                )}
                onClick={() => setCurrentSkuId(isExpanded ? null : sku.id)}
              >
                <div className="flex items-center gap-3">
                  {evaluated ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{sku.name}</div>
                    <div className="text-sm text-gray-500">¥ {sku.price}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  {evaluated && <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs">已评测</span>}
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {isExpanded && (
                <EvaluationForm 
                  roomId={room.id}
                  sku={sku}
                  evaluatorId={evaluatorId}
                  existingEvaluation={getEvaluation(sku.id)}
                  onSave={onSaveEvaluation}
                />
              )}
            </div>
          );
        })}
        
        {/* Fill empty space if page is not full to maintain some height consistency? 
            Not strictly necessary if we let it flow. 
        */}
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          上一页
        </button>
        
        <span className="text-sm text-gray-600 font-medium">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          下一页
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
