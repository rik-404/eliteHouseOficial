import React from 'react';
import { Link } from 'react-router-dom';
import { NotificationBadge } from './NotificationBadge';

interface SidebarProps {
  pendingCount: number;
}

export default function Sidebar({ pendingCount }: SidebarProps) {
  return (
    <div className="w-64 bg-gray-800 text-white h-full">
      <div className="p-4">
        <Link to="/admin" className="text-xl font-bold mb-8">
          Elite House
        </Link>
        <nav>
          <Link to="/admin/clients" className="flex items-center gap-2 p-3 hover:bg-gray-700 rounded">
            <span>Clientes</span>
            <NotificationBadge count={pendingCount} className="ml-auto" />
          </Link>
          <Link to="/admin/contacts" className="flex items-center gap-2 p-3 hover:bg-gray-700 rounded">
            Contatos
          </Link>
          <Link to="/admin/reports" className="flex items-center gap-2 p-3 hover:bg-gray-700 rounded">
            Relatórios
          </Link>
        </nav>
      </div>
    </div>
  );
}
