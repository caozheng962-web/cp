import { useState, useEffect } from 'react';
import { Evaluation, SKU } from '@/lib/types';
import { ISSUE_OPTIONS } from '@/lib/mockData';
import { Save } from 'lucide-react';

interface EvaluationFormProps {
  roomId: string;
  sku: SKU;
  evaluatorId: string;
  existingEvaluation?: Evaluation;
  onSave: (evaluation: Evaluation) => Promise<void>;
}

export function EvaluationForm({ 
  roomId, 
  sku, 
  evaluatorId,
  existingEvaluation, 
  onSave 
}: EvaluationFormProps) {
  const [formData, setFormData] = useState<Partial<Evaluation>>({
    videoQualified: undefined,
    visualQualified: undefined,
    boardAppearanceCount: undefined,
    issues: [],
    otherIssueDesc: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveMessage, setSaveMessage] = useState<string>('');

  useEffect(() => {
    if (existingEvaluation) {
      setFormData({
        videoQualified: existingEvaluation.videoQualified,
        visualQualified: existingEvaluation.visualQualified,
        boardAppearanceCount: existingEvaluation.boardAppearanceCount,
        issues: existingEvaluation.issues || [],
        otherIssueDesc: existingEvaluation.otherIssueDesc || '',
      });
    }
  }, [existingEvaluation]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.videoQualified) newErrors.videoQualified = '请选择是否合格';
    if (!formData.visualQualified) newErrors.visualQualified = '请选择是否合格';
    if (formData.boardAppearanceCount === undefined || formData.boardAppearanceCount < 0) {
      newErrors.boardAppearanceCount = '请输入≥0的整数';
    }
    if (formData.issues?.includes('other') && !formData.otherIssueDesc?.trim()) {
      newErrors.otherIssueDesc = '请填写其他问题说明';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      const evaluation: Evaluation = {
        roomId,
        skuId: sku.id,
        evaluatorId,
        videoQualified: formData.videoQualified!,
        visualQualified: formData.visualQualified!,
        boardAppearanceCount: Number(formData.boardAppearanceCount),
        issues: formData.issues || [],
        otherIssueDesc: formData.otherIssueDesc,
        timestamp: Date.now(),
      };
      
      await onSave(evaluation);
      setSaveMessage('已保存当前 SKU 评测');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Save failed', error);
      setSaveMessage('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-b-lg border-t border-gray-200 space-y-6">
      {/* Question 1 */}
      <div className="space-y-2">
        <label className="block font-medium text-gray-700">1. 该 SKU 所在的视频片段整体是否合格？</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="videoQualified" 
              checked={formData.videoQualified === 'qualified'} 
              onChange={() => setFormData({...formData, videoQualified: 'qualified'})}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span>合格</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="videoQualified" 
              checked={formData.videoQualified === 'unqualified'} 
              onChange={() => setFormData({...formData, videoQualified: 'unqualified'})}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span>不合格</span>
          </label>
        </div>
        {errors.videoQualified && <p className="text-red-500 text-sm">{errors.videoQualified}</p>}
      </div>

      {/* Question 2 */}
      <div className="space-y-2">
        <label className="block font-medium text-gray-700">2. 该 SKU 的 KT 板视觉是否合格？</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="visualQualified" 
              checked={formData.visualQualified === 'qualified'} 
              onChange={() => setFormData({...formData, visualQualified: 'qualified'})}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span>合格</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="visualQualified" 
              checked={formData.visualQualified === 'unqualified'} 
              onChange={() => setFormData({...formData, visualQualified: 'unqualified'})}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span>不合格</span>
          </label>
        </div>
        {errors.visualQualified && <p className="text-red-500 text-sm">{errors.visualQualified}</p>}
      </div>

      {/* Question 3 */}
      <div className="space-y-2">
        <label className="block font-medium text-gray-700">3. 该 SKU 对应的视频片段中，KT 板出现了几次？</label>
        <input 
          type="number" 
          min="0"
          value={formData.boardAppearanceCount ?? ''}
          onChange={(e) => setFormData({...formData, boardAppearanceCount: e.target.valueAsNumber})}
          placeholder="请输入出现次数，如：3"
          className="w-full max-w-xs p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        {errors.boardAppearanceCount && <p className="text-red-500 text-sm">{errors.boardAppearanceCount}</p>}
      </div>

      {/* Question 4 (Checkboxes) */}
      <div className="space-y-2">
        <label className="block font-medium text-gray-700">当前 SKU 存在哪些问题？（可多选）</label>
        <div className="space-y-2">
          {ISSUE_OPTIONS.map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={formData.issues?.includes(opt.id)}
                onChange={(e) => {
                  const newIssues = e.target.checked 
                    ? [...(formData.issues || []), opt.id]
                    : (formData.issues || []).filter(id => id !== opt.id);
                  setFormData({...formData, issues: newIssues});
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Other Issue Description */}
      {formData.issues?.includes('other') && (
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">其他问题说明 <span className="text-red-500">*</span></label>
          <textarea 
            value={formData.otherIssueDesc}
            onChange={(e) => setFormData({...formData, otherIssueDesc: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="请简要说明问题..."
            rows={3}
          />
          {errors.otherIssueDesc && <p className="text-red-500 text-sm">{errors.otherIssueDesc}</p>}
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4 flex items-center justify-between border-t border-gray-200">
        <div className="text-green-600 font-medium h-6">
          {saveMessage}
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? '保存中...' : '保存当前 SKU 评测'}
        </button>
      </div>
    </div>
  );
}
