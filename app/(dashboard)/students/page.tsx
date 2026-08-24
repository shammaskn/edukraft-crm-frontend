'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsApi, CreateStudentInput, UpdateStudentInput } from '@/lib/api/students';
import { Student } from '@/types';
import { useAuth } from '@/lib/auth';
import StudentFormModal from '@/components/students/StudentFormModal';
import { Plus, Pencil, Trash2, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [search, setSearch] = useState('');

  // Fetch students
  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentsApi.getAll,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: studentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowModal(false);
      toast.success('Student added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add student');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentInput }) =>
      studentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowModal(false);
      setEditingStudent(null);
      toast.success('Student updated successfully');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: studentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
        toast.success('Student deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete student');
    },
  });

  // Filter students
  const filteredStudents = students.filter((student) =>
    student.firstName.toLowerCase().includes(search.toLowerCase()) ||
    student.lastName.toLowerCase().includes(search.toLowerCase()) ||
    student.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (data: CreateStudentInput) => {
    if (editingStudent) {
      await updateMutation.mutateAsync({ id: editingStudent.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStudent(null);
  };

  return (
    <div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
          <p className="text-gray-500 text-sm mt-1">
            {students.length} total students
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Student
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No students found</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-blue-600 text-sm hover:underline"
            >
              Add your first student
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Address</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">

                  {/* Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-sm font-medium">
                          {student.firstName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </p>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Mail size={12} />
                        {student.email}
                      </div>
                      {student.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Phone size={12} />
                          {student.phone}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Address */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {student.address || '—'}
                    </p>
                  </td>

                  {/* Joined date */}
                  <td className="px-6 py-4">
                    <p className="text-xs text-gray-500">
                      {new Date(student.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(student)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      {user?.role === 'ADMIN' && (
                        <button
                          onClick={() => handleDelete(student.id)}
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
        <StudentFormModal
          student={editingStudent}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
        />
      )}

    </div>
  );
}