import { useState } from 'react';
import { Modal } from '@/app/components/Modal';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (name: string, department: string) => void;
}

export function LoginModal({ isOpen, onLogin }: LoginModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'evaluator' | 'admin'>('evaluator');
  
  // Evaluator state
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  
  // Admin state
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const [error, setError] = useState('');

  const handleEvaluatorSubmit = () => {
    if (!name.trim() || !department.trim()) {
      setError('请填写完整信息');
      return;
    }
    onLogin(name.trim(), department.trim());
  };

  const handleAdminSubmit = () => {
    if (adminId === '京东科技-曹政' && adminPassword === '123456') {
      // Login success
      localStorage.setItem('admin_token', 'true');
      window.location.href = '/admin'; // Force reload/redirect to ensure state is fresh
    } else {
      setError('管理员 ID 或密码错误，请重试。');
    }
  };

  const switchMode = (newMode: 'evaluator' | 'admin') => {
    setMode(newMode);
    setError('');
    // Clear inputs if needed, or keep them
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title={mode === 'evaluator' ? '欢迎评测' : '管理员登录'} showCloseButton={false}>
      <div className="space-y-4">
        
        {mode === 'evaluator' ? (
          <>
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
          </>
        ) : (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">管理员 ID</label>
              <input 
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="请输入管理员 ID"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">密码</label>
              <input 
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button 
          onClick={mode === 'evaluator' ? handleEvaluatorSubmit : handleAdminSubmit}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4"
        >
          {mode === 'evaluator' ? '开始评测' : '登录管理员后台'}
        </button>

        <div className="text-center pt-2">
          {mode === 'evaluator' ? (
            <button 
              onClick={() => switchMode('admin')}
              className="text-sm text-blue-600 hover:underline"
            >
              我是管理员
            </button>
          ) : (
            <button 
              onClick={() => switchMode('evaluator')}
              className="text-sm text-gray-500 hover:underline"
            >
              返回评测入口
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
