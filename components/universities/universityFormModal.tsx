'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { University } from '@/types';
import { X, Loader2 } from 'lucide-react';

const universitySchema = z.object({
  name:        z.string().min(2, 'Name must be at least 2 characters'),
  location:    z.string().min(2, 'Location must be at least 2 characters'),
  website:     z.string().url('Invalid URL').optional().or(z.literal('')),
  description: z.string().optional(),
});

type UniversityFormData = z.infer<typeof universitySchema>;

interface Props {
  university?: University | null;
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
}

export default function UniversityFormModal({ university, onSubmit, onClose }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UniversityFormData>({
    resolver: zodResolver(universitySchema),
    defaultValues: university ? {
      name:        university.name,
      location:    university.location,
      website:     university.website || '',
      description: university.description || '',
    } : {},
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {university ? 'Edit University' : 'Add University'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              University Name
            </label>
            <input
              {...register('name')}
              placeholder="e.g. University of London"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              {...register('location')}
              placeholder="e.g. London, UK"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.location && (
              <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website <span className="text-gray-400">(optional)</span>
            </label>
            <input
              {...register('website')}
              placeholder="https://university.ac.uk"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.website && (
              <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>
            )}
          </div>

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
                university ? 'Update' : 'Add University'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}