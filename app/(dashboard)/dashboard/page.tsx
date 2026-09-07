'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import api from '@/lib/axios';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  Users,
  TrendingUp,
  BookOpen,
  FileText,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  counts: {
    students: number;
    leads: number;
    courses: number;
    applications: number;
  };
  conversion: {
    totalLeads: number;
    convertedLeads: number;
    conversionRate: string;
  };
  leadsByStatus: { status: string; _count: { status: number } }[];
  applicationsByStatus: { status: string; _count: { status: number } }[];
  recentLeads: any[];
  recentApplications: any[];
}

const fetchStats = async (): Promise<DashboardStats> => {
  const res = await api.get('/dashboard/stats');
  return res.data.data;
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
  href: string;
}) => (
  <Link href={href}>
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-200 transition-colors cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{title}</p>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  </Link>
);

const statusColors: Record<string, string> = {
  NEW:        'bg-blue-100 text-blue-700',
  CONTACTED:  'bg-yellow-100 text-yellow-700',
  QUALIFIED:  'bg-purple-100 text-purple-700',
  ENROLLED:   'bg-green-100 text-green-700',
  LOST:       'bg-red-100 text-red-700',
  PENDING:    'bg-yellow-100 text-yellow-700',
  APPROVED:   'bg-green-100 text-green-700',
  REJECTED:   'bg-red-100 text-red-700',
};

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchStats,
    refetchInterval: 60000, // refresh every minute
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">

      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.name} 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Here's what's happening at EduKraft today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.counts.students}
          icon={Users}
          color="bg-blue-500"
          href="/students"
        />
        <StatCard
          title="Total Leads"
          value={stats.counts.leads}
          icon={TrendingUp}
          color="bg-green-500"
          href="/leads"
        />
        <StatCard
          title="Total Courses"
          value={stats.counts.courses}
          icon={BookOpen}
          color="bg-purple-500"
          href="/courses"
        />
        <StatCard
          title="Applications"
          value={stats.counts.applications}
          icon={FileText}
          color="bg-amber-500"
          href="/applications"
        />
      </div>

      {/* Conversion Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Lead Conversion
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-semibold text-gray-900">
              {stats.conversion.totalLeads}
            </p>
            <p className="text-sm text-gray-500 mt-1">Total Leads</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-semibold text-green-600">
              {stats.conversion.convertedLeads}
            </p>
            <p className="text-sm text-gray-500 mt-1">Converted</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-semibold text-blue-600">
              {stats.conversion.conversionRate}
            </p>
            <p className="text-sm text-gray-500 mt-1">Conversion Rate</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{
                width: stats.conversion.conversionRate
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Leads by Status + Applications by Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Leads by Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Leads by Status
            </h2>
            <Link
              href="/leads"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.leadsByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[item.status]}`}>
                  {item.status}
                </span>
                <div className="flex items-center gap-3 flex-1 ml-3">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{
                        width: `${(item._count.status / stats.counts.leads) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-6 text-right">
                    {item._count.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Applications by Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Applications by Status
            </h2>
            <Link
              href="/applications"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.applicationsByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[item.status]}`}>
                  {item.status}
                </span>
                <div className="flex items-center gap-3 flex-1 ml-3">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full"
                      style={{
                        width: stats.counts.applications > 0
                          ? `${(item._count.status / stats.counts.applications) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-6 text-right">
                    {item._count.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Leads + Recent Applications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Recent Leads */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Recent Leads
            </h2>
            <Link
              href="/leads"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentLeads.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No leads yet</p>
            ) : (
              stats.recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {lead.firstName} {lead.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{lead.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[lead.status]}`}>
                    {lead.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Recent Applications
            </h2>
            <Link
              href="/applications"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentApplications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No applications yet</p>
            ) : (
              stats.recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {app.student.firstName} {app.student.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{app.course.title}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[app.status]}`}>
                    {app.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}