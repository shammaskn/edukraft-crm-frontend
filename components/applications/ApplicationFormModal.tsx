'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Student, Course } from '@/types';
import { X, Loader2 } from 'lucide-react';

const applicationSchema = z.object({
  studentId: z.string().min(1, 'Please select a student'),
  courseId:  z.string().min(1, 'Please select a course'),
  notes:     z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface Props {
  students: Student[];
  courses: Course[];
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
}

export default function ApplicationFormModal({
  students,
  courses,
  onSubmit,
  onClose,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            New Application
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Student select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student
            </label>
            <select
              {...register('studentId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName} — {student.email}
                </option>
              ))}
            </select>
            {errors.studentId && (
              <p className="text-red-500 text-xs mt-1">{errors.studentId.message}</p>
            )}
          </div>

          {/* Course select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course
            </label>
            <select
              {...register('courseId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a course</option>
              {courses
                .filter((c) => c.isActive)
                .map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} — £{course.fee} — {course.duration} weeks
                  </option>
                ))}
            </select>
            {errors.courseId && (
              <p className="text-red-500 text-xs mt-1">{errors.courseId.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Any additional notes about this application..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>

        </form>
      </div>  
    </div>
  );
}