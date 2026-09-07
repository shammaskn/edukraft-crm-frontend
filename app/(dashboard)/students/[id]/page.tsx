'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsApi } from '@/lib/api/students';
import { applicationsApi } from '@/lib/api/applications';
import { coursesApi } from '@/lib/api/courses';
import { useAuth } from '@/lib/auth';
import StatusBadge from '@/components/ui/StatusBadge';
import ApplicationFormModal from '@/components/applications/ApplicationFormModal';
import { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Plus, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Student | null>(null);
  // Fetch student
  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentsApi.getById(id),
  });

  // Fetch all applications and filter for this student
  const { data: allApplications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: applicationsApi.getAll,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: coursesApi.getAll,
  });

  // Filter applications for this student
  const studentApplications = allApplications.filter(
    (app) => app.studentId === id
  );

  const createApplicationMutation = useMutation({
    mutationFn: applicationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setShowApplicationModal(false);
      toast.success('Application created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create application');
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      applicationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update application');
    },
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: applicationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setConfirmDelete(null);
      toast.success('Application deleted');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Student not found</p>
        <button
          onClick={() => router.back()}
          className="mt-3 text-blue-600 text-sm hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">

      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
      >
        <ArrowLeft size={16} />
        Back to Students
      </button>

      {/* Student header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center">
              <span className="text-blue-600 text-2xl font-semibold">
                {student.firstName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {student.firstName} {student.lastName}
              </h1>
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail size={14} />
                  {student.email}
                </div>
                {student.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone size={14} />
                    {student.phone}
                  </div>
                )}
                {student.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={14} />
                    {student.address}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-gray-400">
            <p>Joined {new Date(student.createdAt).toLocaleDateString('en-GB')}</p>
          </div>
        </div>
      </div>

      {/* Applications section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            Applications ({studentApplications.length})
          </h2>
          <button
            onClick={() => setShowApplicationModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} />
            New Application
          </button>
        </div>

        {studentApplications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No applications yet</p>
            <button
              onClick={() => setShowApplicationModal(true)}
              className="mt-2 text-blue-600 text-sm hover:underline"
            >
              Create first application
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {studentApplications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {app.course.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    £{app.course.fee} •{' '}
                    {new Date(app.createdAt).toLocaleDateString('en-GB')}
                  </p>
                  {app.notes && (
                    <p className="text-xs text-gray-400 mt-1">{app.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={app.status} />

                  {/* Approve/Reject for pending - admin only */}
                  {user?.role === 'ADMIN' && app.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => updateApplicationMutation.mutate({
                          id: app.id,
                          data: { status: 'APPROVED' }
                        })}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                        title="Approve"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => updateApplicationMutation.mutate({
                          id: app.id,
                          data: { status: 'REJECTED' }
                        })}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Reject"
                      >
                        <XCircle size={16} />
                      </button>
                    </>
                  )}

                  {/* Delete - admin only */}
                  {user?.role === 'ADMIN' && (
                    <button
                    onClick={() => setConfirmDelete(app.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Application Modal */}
      {showApplicationModal && student && (
        <ApplicationFormModal
          students={[student]}
          courses={courses}
          onSubmit={(data) => createApplicationMutation.mutateAsync(data)}
          onClose={() => setShowApplicationModal(false)}
          preSelectedStudent={student}
        />
      )}
      {confirmDelete && (
  <ConfirmModal
    title="Delete Application"
    message="Are you sure you want to delete this application?"
    isLoading={deleteApplicationMutation.isPending}
    onConfirm={() => deleteApplicationMutation.mutate(confirmDelete)}
    onCancel={() => setConfirmDelete(null)}
  />
)}
    </div>
  );
}