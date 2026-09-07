'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi, CreateLeadInput, UpdateLeadInput } from '@/lib/api/leads';
import { studentsApi } from '@/lib/api/students';
import { coursesApi } from '@/lib/api/courses';
import { Lead } from '@/types';
import { useAuth } from '@/lib/auth';
import ConfirmModal from '@/components/ui/ConfirmModal';
import StatusBadge from '@/components/ui/StatusBadge';
import LeadFormModal from '@/components/leads/LeadFormModal';
import ApplicationFormModal from '@/components/applications/ApplicationFormModal';
import { Plus, Pencil, Trash2, Phone, Mail, UserCheck, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { universitiesApi } from '@/lib/api/universities';
const statusOptions = ['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'ENROLLED', 'LOST'];

export default function LeadsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [convertedStudentId, setConvertedStudentId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [confirmDelete, setConfirmDelete] = useState<Lead | null>(null);
  const [search, setSearch] = useState('');
  const [confirmConvert, setConfirmConvert] = useState<Lead | null>(null);
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: leadsApi.getAll,
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: studentsApi.getAll,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: coursesApi.getAll,
  });
  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: universitiesApi.getAll,
  });
  const createMutation = useMutation({
    mutationFn: leadsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setShowModal(false);
      toast.success('Lead added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add lead');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadInput }) =>
      leadsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setShowModal(false);
      setEditingLead(null);
      toast.success('Lead updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update lead');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: leadsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete lead');
    },
  });

  const convertMutation = useMutation({
    mutationFn: leadsApi.convert,
    onSuccess: async (student) => {
      await queryClient.invalidateQueries({ queryKey: ['leads'] });
      await queryClient.invalidateQueries({ queryKey: ['students'] });
      await queryClient.refetchQueries({ queryKey: ['students'] }); // ← force refetch
      toast.success('Lead converted to student successfully');
      setConvertedStudentId(student.id);
      setShowApplicationModal(true);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to convert lead');
    },
  });

  const createApplicationMutation = useMutation({
    mutationFn: (data: any) =>
      import('@/lib/api/applications').then(({ applicationsApi }) =>
        applicationsApi.create(data)
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setShowApplicationModal(false);
      setConvertedStudentId(null);
      toast.success('Application created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create application');
    },
  });

  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    const matchesSearch =
      lead.firstName.toLowerCase().includes(search.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSubmit = async (data: CreateLeadInput) => {
    if (editingLead) {
      await updateMutation.mutateAsync({ id: editingLead.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleConfirmConvert = async () => {
    if (!confirmConvert) return;
    await convertMutation.mutateAsync(confirmConvert.id);
    setConfirmConvert(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLead(null);
  };

  const handleApplicationSubmit = async (data: any) => {
    await createApplicationMutation.mutateAsync(data);
  };

  // Filter students for application modal
  // Only show the newly converted student
  const convertedStudent = students.filter(s =>
    s.id === convertedStudentId
  );

  return (
    <div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
          <p className="text-gray-500 text-sm mt-1">
            {leads.length} total leads
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map((status) => (
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

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No leads found</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-blue-600 text-sm hover:underline"
            >
              Add your first lead
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">

                  {/* Name */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">
                      {lead.firstName} {lead.lastName}
                    </p>
                    {lead.notes && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-48">
                        {lead.notes}
                      </p>
                    )}
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Mail size={12} />
                        {lead.email}
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Phone size={12} />
                          {lead.phone}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Source */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {lead.source || '—'}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {lead.status === 'ENROLLED' ? (
                      <StatusBadge status={lead.status} />
                    ) : (
                      <select
                        value={lead.status}
                        onChange={(e) => updateMutation.mutate({
                          id: lead.id,
                          data: { status: e.target.value as any }
                        })}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${lead.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                          lead.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-700' :
                            lead.status === 'QUALIFIED' ? 'bg-purple-100 text-purple-700' :
                              'bg-red-100 text-red-700'
                          }`}
                      >
                        <option value="NEW">🔵 NEW</option>
                        <option value="CONTACTED">🟡 CONTACTED</option>
                        <option value="QUALIFIED">🟣 QUALIFIED</option>
                        <option value="LOST">🔴 LOST</option>
                      </select>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4">
                    <p className="text-xs text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">

                      {/* Convert button - show for non-enrolled, non-lost leads */}
                      {lead.status !== 'ENROLLED' && lead.status !== 'LOST' && (
                        <button
                          onClick={() => setConfirmConvert(lead)}
                          disabled={convertMutation.isPending}
                          className="flex items-center gap-1 px-2 py-1.5 text-xs text-green-600 hover:bg-green-50 rounded-lg transition-colors font-medium"
                          title="Convert to Student"
                        >
                          <UserCheck size={14} />
                          Convert
                        </button>
                      )}

                      {/* View Student button - show for enrolled leads */}
                      {lead.status === 'ENROLLED' && lead.studentId && (
                        <button
                          onClick={() => router.push(`/students/${lead.studentId}`)}
                          className="flex items-center gap-1 px-2 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                        >
                          <Eye size={14} />
                          View Student
                        </button>
                      )}

                      {/* Edit button - hide for enrolled */}
                      {lead.status !== 'ENROLLED' && (
                        <button
                          onClick={() => handleEdit(lead)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                      )}

                      {/* Delete button - admin only */}
                      {user?.role === 'ADMIN' && (
                        <button
                          onClick={() => setConfirmDelete(lead)}
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

      {/* Lead Form Modal */}
      {showModal && (
        <LeadFormModal
          lead={editingLead}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
        />
      )}

      {/* Application Modal - opens after conversion */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Create Application
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Student converted successfully. Select a course to apply for.
              </p>
            </div>
            <ApplicationFormModal
              students={convertedStudent.length > 0 ? convertedStudent : students}
              courses={courses}
              onSubmit={handleApplicationSubmit}
              onClose={() => {
                setShowApplicationModal(false);
                setConvertedStudentId(null);
              }}
              preSelectedStudent={students.find(s => s.id === convertedStudentId) || undefined}
            />
          </div>
        </div>
      )}
      {confirmDelete && (
        <ConfirmModal
          title="Delete X"
          message={`Are you sure you want to delete ${confirmDelete.name}?`}
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {confirmConvert && (
        <ConfirmModal
          title="Convert to Student"
          message={`Convert ${confirmConvert.firstName} ${confirmConvert.lastName} to a student? This will create a student account and update lead status to ENROLLED.`}
          confirmLabel="Convert"
          isLoading={convertMutation.isPending}
          onConfirm={handleConfirmConvert}
          onCancel={() => setConfirmConvert(null)}
          variant="primary"
        />
      )}
    </div>
  );
}