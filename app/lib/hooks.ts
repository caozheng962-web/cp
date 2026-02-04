import { useState, useEffect } from 'react';

export function useEvaluatorInfo() {
  const [evaluatorId, setEvaluatorId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('evaluator_id');
      if (id) {
        setEvaluatorId(id);
      }
      setIsLoaded(true);
    }
  }, []);

  const login = (name: string, department: string) => {
    // Generate a simple ID or use the name directly if unique enough for this context
    // User requested "Department-Name"
    const id = `${department}-${name}`;
    localStorage.setItem('evaluator_id', id);
    setEvaluatorId(id);
  };

  const logout = () => {
    localStorage.removeItem('evaluator_id');
    setEvaluatorId(null);
  };

  return { evaluatorId, isLoaded, login, logout };
}
