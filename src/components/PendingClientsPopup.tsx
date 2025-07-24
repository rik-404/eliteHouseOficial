import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface PendingClientsPopupProps {
  count: number;
  onView: () => void;
  onClose: () => void;
}

export const PendingClientsPopup: React.FC<PendingClientsPopupProps> = ({
  count,
  onView,
  onClose,
}) => {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-orange-400 p-4 max-w-sm z-50">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg text-orange-600 dark:text-orange-400">
          Clientes Pendentes
        </h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Você tem <span className="font-bold">{count} cliente{count !== 1 ? 's' : ''} pendente{count !== 1 ? 's' : ''}</span> aguardando sua análise.
      </p>
      <div className="flex gap-2 justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onClose}
        >
          Ver mais tarde
        </Button>
        <Button 
          variant="default" 
          size="sm"
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={onView}
        >
          Ver Agora
        </Button>
      </div>
    </div>
  );
};
