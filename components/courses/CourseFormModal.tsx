'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Course } from '@/types';
import { X, Loader2 } from 'lucide-react';

const courseSchema = z.object({
  title:       z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  duration:    z.coerce.number().min(1, 'Duration must be at least 1 week'),
  fee:         z.coerce.number().min(0, 'Fee cannot be negative'),
});

type CourseFormData = z.infer<typeof courseSchema>; 

interface Props {
  course?: Course | null;
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
}

export default function CourseFormModal({ course, onSubmit, onClose }: Props) {
  const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm<z.output<typeof courseSchema>>({
  // @ts-ignore
  resolver: zodResolver(courseSchema),
  defaultValues: course ? {
    title:       course.title,
    description: course.description || '',
    duration:    course.duration,
    fee:         course.fee,
  } : {},
});

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {course ? 'Edit Course' : 'Add New Course'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Title
            </label>
            <input
              {...register('title')}
              placeholder="e.g. IELTS Preparation"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Duration + Fee row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (weeks)
              </label>
              <input
                {...register('duration')}
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.duration && (
                <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee (£)
              </label>
              <input
                {...register('fee')}
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.fee && (
                <p className="text-red-500 text-xs mt-1">{errors.fee.message}</p>
              )}
            </div>
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
                  Saving...
                </>
              ) : (
                course ? 'Update Course' : 'Add Course'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export type { CourseFormData };