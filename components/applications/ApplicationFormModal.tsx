'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Student, Course } from '@/types';
import { X, Loader2, Search } from 'lucide-react';

const applicationSchema = z.object({
  studentId: z.string().min(1, 'Please select a student'),
  courseId:  z.string().min(1, 'Please select a course'),
  notes:     z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface Props {
  students: Student[];
  courses: Course[];
  onSubmit: (data: any) => Promise<any>;
  onClose: () => void;
  preSelectedStudent?: Student;
}

export default function ApplicationFormModal({
  students,
  courses,
  onSubmit,
  onClose,
  preSelectedStudent,
}: Props) {
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(
    preSelectedStudent || null
  );
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      studentId: preSelectedStudent?.id || '',
    },
  });

  const filteredStudents = students.filter((student) =>
    `${student.firstName} ${student.lastName} ${student.email}`
      .toLowerCase()
      .includes(studentSearch.toLowerCase())
  ).slice(0, 8);

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setStudentSearch(`${student.firstName} ${student.lastName}`);
    setValue('studentId', student.id);
    setShowStudentDropdown(false);
  };

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Student section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student
            </label>

            {/* If student is pre-selected → show info only, no search */}
            {preSelectedStudent ? (
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs font-medium">
                    {preSelectedStudent.firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">
                    {preSelectedStudent.firstName} {preSelectedStudent.lastName}
                  </p>
                  <p className="text-xs text-blue-500">{preSelectedStudent.email}</p>
                </div>
              </div>
            ) : (
              /* No pre-selected student → show search box */
              <div className="relative">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => {
                      setStudentSearch(e.target.value);
                      setShowStudentDropdown(true);
                      setSelectedStudent(null);
                      setValue('studentId', '');
                    }}
                    onFocus={() => setShowStudentDropdown(true)}
                    placeholder="Search student by name or email..."
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Dropdown results */}
                {showStudentDropdown && studentSearch && filteredStudents.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filteredStudents.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => handleSelectStudent(student)}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* No results */}
                {showStudentDropdown && studentSearch && filteredStudents.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3">
                    <p className="text-sm text-gray-500 text-center">No students found</p>
                  </div>
                )}

                {/* Selected student confirmation */}
                {selectedStudent && (
                  <div className="mt-2 flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                    <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-xs font-medium">
                        {selectedStudent.firstName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 font-medium">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </p>
                  </div>
                )}
              </div>
            )}

            {errors.studentId && (
              <p className="text-red-500 text-xs mt-1">{errors.studentId.message}</p>
            )}
            <input type="hidden" {...register('studentId')} />
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
              placeholder="Any additional notes..."
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
              disabled={isSubmitting || (!preSelectedStudent && !selectedStudent)}
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