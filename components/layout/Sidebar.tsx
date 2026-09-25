'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  TrendingUp,
  FileText,
  BookMarked,
  GraduationCap,
  UserCog,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard, adminOnly: false },
  { href: '/leads',        label: 'Leads',        icon: TrendingUp,      adminOnly: false },
  { href: '/students',     label: 'Students',     icon: Users,           adminOnly: false },
  { href: '/courses',      label: 'Courses',      icon: BookOpen,        adminOnly: false },
  { href: '/universities', label: 'Universities', icon: GraduationCap,   adminOnly: false },
  { href: '/applications', label: 'Applications', icon: FileText,        adminOnly: false },
  { href: '/users',        label: 'Users',        icon: UserCog,         adminOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0`}>

      {/* Logo */}
      <div className={`p-4 border-b border-gray-200 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
              <BookMarked className="text-white" size={18} />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 text-sm">EduKraft</h1>
              <p className="text-xs text-gray-500">CRM Portal</p>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="bg-blue-600 p-2 rounded-lg">
            <BookMarked className="text-white" size={18} />
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors ${collapsed ? 'mt-2' : ''}`}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems
          .filter(item => !item.adminOnly || user?.role === 'ADMIN')
          .map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : ''}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
      </nav>

      {/* User info at bottom */}
      <div className={`p-4 border-t border-gray-200 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center">
            <span className="text-blue-600 text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
        )}
      </div>

    </aside>
  );
}