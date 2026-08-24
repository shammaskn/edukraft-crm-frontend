'use client';

import { useAuth } from '@/lib/auth';
import { Users, TrendingUp, BookOpen, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

// Stat card component
const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm text-gray-500">{title}</p>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
    <p className="text-3xl font-semibold text-gray-900">{value}</p>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();

  // Fetch counts from API
  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.get('/students').then(res => res.data.data),
  });

  const { data: leads } = useQuery({
    queryKey: ['leads'],
    queryFn: () => api.get('/leads').then(res => res.data.data),
  });

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then(res => res.data.data),
  });

  const { data: applications } = useQuery({
    queryKey: ['applications'],
    queryFn: () => api.get('/applications').then(res => res.data.data),
  });

  return (
    <div>

      {/* Welcome message */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.name} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here's what's happening at EduKraft today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Students"
          value={students?.length || 0}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Leads"
          value={leads?.length || 0}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatCard
          title="Total Courses"
          value={courses?.length || 0}
          icon={BookOpen}
          color="bg-purple-500"
        />
        <StatCard
          title="Applications"
          value={applications?.length || 0}
          icon={FileText}
          color="bg-amber-500"
        />
      </div>

      {/* Recent leads */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Recent Leads
        </h3>
        <div className="space-y-3">
          {leads?.slice(0, 5).map((lead: any) => (
            <div
              key={lead.id}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {lead.firstName} {lead.lastName}
                </p>
                <p className="text-xs text-gray-500">{lead.email}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                lead.status === 'NEW'        ? 'bg-blue-100 text-blue-700' :
                lead.status === 'CONTACTED'  ? 'bg-yellow-100 text-yellow-700' :
                lead.status === 'QUALIFIED'  ? 'bg-purple-100 text-purple-700' :
                lead.status === 'ENROLLED'   ? 'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'
              }`}>
                {lead.status}
              </span>
            </div>
          ))}
          {(!leads || leads.length === 0) && (
            <p className="text-sm text-gray-500 text-center py-4">
              No leads yet
            </p>
          )}
        </div>
      </div>

    </div>
  );
}