'use client';

import { useAuth } from '@/lib/auth';
import { LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';

// Map routes to page titles
const pageTitles: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/leads':        'Leads',
  '/students':     'Students',
  '/courses':      'Courses',
  '/universities': 'Universities',
  '/applications': 'Applications',

};

export default function Topbar() {
  const { logout } = useAuth();
  const pathname = usePathname();
  const title = pageTitles[pathname] || 'EduKraft CRM';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">

      {/* Page title */}
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

      {/* Logout button */}
      <button
        onClick={logout}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
      >
        <LogOut size={16} />
        Logout
      </button>

    </header>
  );
}