'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  TrendingUp,
  FileText,
  BookMarked,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads',     label: 'Leads',     icon: TrendingUp },
  { href: '/students',  label: 'Students',  icon: Users },
  { href: '/courses',   label: 'Courses',   icon: BookOpen },
  { href: '/applications', label: 'Applications', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">

      {/* Logo */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <BookMarked className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 text-sm">EduKraft</h1>
            <p className="text-xs text-gray-500">CRM Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info at bottom */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center">
            <span className="text-blue-600 text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>
      </div>

    </aside>
  );
}