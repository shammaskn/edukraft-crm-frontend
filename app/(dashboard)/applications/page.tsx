'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi, CreateApplicationInput, UpdateApplicationInput } from '@/lib/api/applications';
import { studentsApi } from '@/lib/api/students';
import { coursesApi } from '@/lib/api/courses';
import { Application } from '@/types';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useAuth } from '@/lib/auth';
import ApplicationFormModal from '@/components/applications/ApplicationFormModal';
import StatusBadge from '@/components/ui/StatusBadge';
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { universitiesApi } from '@/lib/api/universities';
const statusFilters = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

export default function ApplicationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Application | null>(null);
  // Fetch data
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: applicationsApi.getAll,
  });
  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: universitiesApi.getAll,
  });
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: studentsApi.getAll,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: coursesApi.getAll,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: applicationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setShowModal(false);
      toast.success('Application submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    },
  });

  // Update mutation (approve/reject)
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApplicationInput }) =>
      applicationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update application');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: applicationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete application');
    },
  });

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesSearch =
      app.student.firstName.toLowerCase().includes(search.toLowerCase()) ||
      app.student.lastName.toLowerCase().includes(search.toLowerCase()) ||
      app.course.title.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSubmit = async (data: CreateApplicationInput) => {
    await createMutation.mutateAsync(data);
  };

  const handleApprove = (id: string) => {
    updateMutation.mutate({ id, data: { status: 'APPROVED' } });
  };

  const handleReject = (id: string) => {
    updateMutation.mutate({ id, data: { status: 'REJECTED' } });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Applications</h1>
          <p className="text-gray-500 text-sm mt-1">
            {applications.length} total applications
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          New Application
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by student or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            {statusFilters.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No applications found</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-blue-600 text-sm hover:underline"
            >
              Create first application
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Notes</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">

                  {/* Student */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-sm font-medium">
                          {app.student.firstName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {app.student.firstName} {app.student.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{app.student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">
                      {app.course.title}
                    </p>
                    {app.course.university && (
                      <p className="text-xs text-gray-500">
                        {app.course.university.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">£{app.course.fee}</p>
                  </td>
                  {/* Course */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">
                      {app.course.title}
                    </p>
                    <p className="text-xs text-gray-500">£{app.course.fee}</p>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusBadge status={app.status} />
                  </td>

                  {/* Notes */}
                  <td className="px-6 py-4">
                    <p className="text-xs text-gray-500 max-w-32 truncate">
                      {app.notes || '—'}
                    </p>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4">
                    <p className="text-xs text-gray-500">
                      {new Date(app.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* Approve/Reject - Admin only, only for PENDING */}
                      {user?.role === 'ADMIN' && app.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(app.id)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleReject(app.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {user?.role === 'ADMIN' && (
                        <button
                          onClick={() => setConfirmDelete(app)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ApplicationFormModal
          students={students}
          courses={courses}
          
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}
      {confirmDelete && (
        <ConfirmModal
          title="Delete Application"
          message={`Are you sure you want to delete ?`}
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

    </div>
  );
}