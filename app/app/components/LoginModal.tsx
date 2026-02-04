import { useState } from 'react';
import { Modal } from '@/app/components/Modal'; // Assuming Modal is in the same directory or adjust import
import { X } from 'lucide-react'; // Verify if X is used, otherwise remove

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (name: string, department: string) => void;
}

export function LoginModal({ isOpen, onLogin }: LoginModalProps) {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !department.trim()) {
      setError('请填写完整信息');
      return;
    }
    onLogin(name.trim(), department.trim());
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="欢迎评测" showCloseButton={false}>
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">请输入您的身份信息开始评测</p>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">事业部</label>
          <input 
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="例如：京东科技"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">姓名</label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：曹政"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button 
          onClick={handleSubmit}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4"
        >
          开始评测
        </button>
      </div>
    </Modal>
  );
}
