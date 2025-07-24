import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface FunnelData {
  status: string;
  count: number;
  color: string;
  width: string;
}

const SalesFunnel = () => {
  const { theme } = useTheme();
  
  const funnelData: FunnelData[] = [
    { status: 'Novo', count: 80, color: 'bg-blue-500', width: 'w-[95%]' },
    { status: 'Atendimento', count: 23, color: 'bg-teal-500', width: 'w-[91.5%]' },
    { status: 'Análise documental', count: 4, color: 'bg-purple-700', width: 'w-[88%]' },
    { status: 'Análise bancária', count: 3, color: 'bg-purple-400', width: 'w-[84.5%]' },
    { status: 'Condicionado', count: 0, color: 'bg-amber-500', width: 'w-[81%]' },
    { status: 'Aprovado', count: 4, color: 'bg-green-500', width: 'w-[77.5%]' },
    { status: 'Reprovado', count: 0, color: 'bg-red-500', width: 'w-[74%]' },
    { status: 'Venda realizada', count: 9, color: 'bg-blue-600', width: 'w-[70.5%]' },
    { status: 'Distrato', count: 0, color: 'bg-gray-600', width: 'w-[67%]' },
  ];

  const totalMovements = funnelData.reduce((sum, item) => sum + item.count, 0);



  return (
    <div className={cn(
      "p-4 rounded-lg shadow-md transition-colors duration-200",
      theme === 'dark' ? "bg-gray-100" : "bg-white border border-gray-200"
    )}>
      <h3 className={cn(
        "text-base font-semibold mb-4 flex items-center",
        theme === 'dark' ? "text-gray-800" : "text-gray-700"
      )}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 mr-1.5 text-gray-700" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z"></path>
        </svg>
        Funil de vendas
      </h3>
      
      <div className="flex flex-col items-center space-y-0.5 max-w-sm mx-auto">
        {funnelData.map((item, index) => (
          <div 
            key={index}
            className={`${item.color} ${item.width} rounded-full py-0.5 px-2 text-center cursor-pointer hover:opacity-90 transition-all duration-200 shadow-sm mb-0.5`}
          >
            <div className="font-medium text-white text-xs">{item.status}</div>
            <div className="text-base font-bold text-white">{item.count}</div>
          </div>
        ))}
        
        <div className="mt-1 text-center font-medium w-full">
          <div className={cn(
            "text-base font-bold",
            theme === 'dark' ? "text-gray-800" : "text-gray-700"
          )}>
            {totalMovements} movimentos de venda
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesFunnel;
