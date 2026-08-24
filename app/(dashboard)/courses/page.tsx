'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi, CreateCourseInput, UpdateCourseInput } from '@/lib/api/courses';
import { Course } from '@/types';
import { useAuth } from '@/lib/auth';
import CourseFormModal from '@/components/courses/CourseFormModal';
import { Plus, Pencil, Trash2, Clock, PoundSterling } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CoursesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [search, setSearch] = useState('');

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: coursesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: coursesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setShowModal(false);
      toast.success('Course added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add course');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseInput }) =>
      coursesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setShowModal(false);
      setEditingCourse(null);
      toast.success('Course updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update course');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: coursesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete course');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      coursesApi.update(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course status updated');
    },
  });

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (data: CreateCourseInput) => {
    if (editingCourse) {
      await updateMutation.mutateAsync({ id: editingCourse.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCourse(null);
  };

  return (
    <div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Courses</h1>
          <p className="text-gray-500 text-sm mt-1">
            {courses.length} total courses
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add Course
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No courses found</p>
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-blue-600 text-sm hover:underline"
            >
              Add your first course
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              {/* Course header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ml-2 flex-shrink-0 ${
                  course.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {course.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Course details */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Clock size={13} />
                  {course.duration} weeks
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <PoundSterling size={13} />
                  {course.fee.toLocaleString()}
                </div>
              </div>

              {/* Actions - Admin only */}
              {user?.role === 'ADMIN' && (
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => toggleActiveMutation.mutate({
                      id: course.id,
                      isActive: !course.isActive
                    })}
                    className={`flex-1 text-xs py-1.5 rounded-lg transition-colors ${
                      course.isActive
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {course.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEdit(course)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CourseFormModal
          course={editingCourse}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
        />
      )}

    </div>
  );
}