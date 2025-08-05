import { useEffect, useState } from 'react';
import { Button } from './button';
import { useServiceWorker } from '@/hooks/useServiceWorker';

export const UpdateNotification = () => {
  const { updateAvailable, updateServiceWorker } = useServiceWorker();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (updateAvailable) {
      setIsVisible(true);
    }
  }, [updateAvailable]);

  const handleUpdate = () => {
    updateServiceWorker();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-w-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <svg
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Atualização disponível!
          </h3>
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Uma nova versão do aplicativo está disponível. Atualize para obter as últimas melhorias.
          </div>
          <div className="mt-4 flex">
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              onClick={handleUpdate}
            >
              Atualizar Agora
            </Button>
            <Button
              type="button"
              className="ml-3 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
              onClick={() => setIsVisible(false)}
            >
              Depois
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
