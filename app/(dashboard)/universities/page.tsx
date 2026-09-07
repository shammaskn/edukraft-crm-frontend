'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { universitiesApi, CreateUniversityInput, UpdateUniversityInput } from '@/lib/api/universities';
import { University } from '@/types';
import { useAuth } from '@/lib/auth';
import UniversityFormModal from '@/components/universities/universityFormModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Plus, Pencil, Trash2, Globe, MapPin, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UniversitiesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<University | null>(null);

  const { data: universities = [], isLoading } = useQuery({
    queryKey: ['universities'],
    queryFn: universitiesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: universitiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      setShowModal(false);
      toast.success('University added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add university');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUniversityInput }) =>
      universitiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      setShowModal(false);
      setEditingUniversity(null);
      toast.success('University updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update university');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: universitiesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      setConfirmDelete(null);
      toast.success('University deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete university');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      universitiesApi.update(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      toast.success('University status updated');
    },
  });

  const filteredUniversities = universities.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (data: any) => {
    const cleanData = {
      ...data,
      website: data.website === '' ? undefined : data.website,
    };
    if (editingUniversity) {
      await updateMutation.mutateAsync({ id: editingUniversity.id, data: cleanData });
    } else {
      await createMutation.mutateAsync(cleanData);
    }
  };

  const handleEdit = (university: University) => {
    setEditingUniversity(university);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUniversity(null);
  };

  return (
    <div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Universities</h1>
          <p className="text-gray-500 text-sm mt-1">
            {universities.length} total universities
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add University
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Universities Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filteredUniversities.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No universities found</p>
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-blue-600 text-sm hover:underline"
            >
              Add your first university
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUniversities.map((university) => (
            <div
              key={university.id}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {university.name}
                  </h3>
                  {university.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {university.description}
                    </p>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ml-2 flex-shrink-0 ${
                  university.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {university.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <MapPin size={12} />
                  {university.location}
                </div>
                {university.website && (
                  <a
                    href={university.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                  >
                    <Globe size={12} />
                    {university.website.replace('https://', '')}
                  </a>
                )}
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <BookOpen size={12} />
                  {university._count?.courses || 0} courses
                </div>
              </div>

              {user?.role === 'ADMIN' && (
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => toggleActiveMutation.mutate({
                      id: university.id,
                      isActive: !university.isActive
                    })}
                    className={`flex-1 text-xs py-1.5 rounded-lg transition-colors ${
                      university.isActive
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {university.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEdit(university)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(university)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showModal && (
        <UniversityFormModal
          university={editingUniversity}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
        />
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <ConfirmModal
          title="Delete University"
          message={`Are you sure you want to delete ${confirmDelete.name}? This will unlink all courses from this university.`}
          confirmLabel="Delete"
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

    </div>
  );
}