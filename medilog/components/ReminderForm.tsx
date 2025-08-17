'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock, AlertCircle, Plus, Edit, X } from 'lucide-react';
import { convertToBS, convertToBSDetailed } from '@/lib/calendar';
import notificationService from '@/lib/notifications';

// Form validation schema
const reminderSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  type: z.enum(['medicine', 'appointment', 'health_check', 'vaccination', 'screening', 'other']),
  category: z.enum(['medication', 'appointment', 'maintenance', 'follow_up', 'preventive']),
  dueDate: z.string().min(1, 'Due date is required'),
  dueTime: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceType: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'custom']).optional(),
  recurrenceInterval: z.number().min(1).max(365).optional(),
  medicationName: z.string().optional(),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  prescriptionRefill: z.boolean().default(false),
  remainingDays: z.number().min(0).optional(),
  doctorName: z.string().optional(),
  location: z.string().optional(),
  appointmentType: z.string().optional(),
  notes: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  tags: z.string().optional(),
});

type ReminderFormData = z.infer<typeof reminderSchema>;

interface ReminderFormProps {
  onSubmit: (data: ReminderFormData) => Promise<void>;
  initialData?: Partial<ReminderFormData>;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

export default function ReminderForm({ 
  onSubmit, 
  initialData, 
  onCancel, 
  mode = 'create' 
}: ReminderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dueDateBS, setDueDateBS] = useState<string>('');
  const [reminderDateBS, setReminderDateBS] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset
  } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'medicine',
      category: 'medication',
      dueDate: '',
      dueTime: '',
      isRecurring: false,
      recurrenceType: 'weekly',
      recurrenceInterval: 1,
      medicationName: '',
      dosage: '',
      frequency: '',
      prescriptionRefill: false,
      remainingDays: 0,
      doctorName: '',
      location: '',
      appointmentType: '',
      notes: '',
      priority: 'medium',
      tags: '',
      ...initialData
    }
  });

  const watchedType = watch('type');
  const watchedCategory = watch('category');
  const watchedDueDate = watch('dueDate');
  const watchedIsRecurring = watch('isRecurring');

  // Update BS dates when AD date changes
  useEffect(() => {
    if (watchedDueDate) {
      const adDate = new Date(watchedDueDate);
      const bsDate = convertToBS(adDate);
      setDueDateBS(bsDate);

      // Calculate reminder date (5 days before)
      const reminderDate = new Date(adDate);
      reminderDate.setDate(reminderDate.getDate() - 5);
      const reminderBSDate = convertToBS(reminderDate);
      setReminderDateBS(reminderBSDate);
    }
  }, [watchedDueDate]);

  // Set default category based on type
  useEffect(() => {
    const typeCategoryMap: Record<string, string> = {
      medicine: 'medication',
      appointment: 'appointment',
      health_check: 'maintenance',
      vaccination: 'preventive',
      screening: 'maintenance',
      other: 'maintenance'
    };

    if (typeCategoryMap[watchedType]) {
      setValue('category', typeCategoryMap[watchedType] as any);
    }
  }, [watchedType, setValue]);

  const handleFormSubmit = async (data: ReminderFormData) => {
    try {
      setIsSubmitting(true);
      
      // Combine date and time if time is provided
      if (data.dueTime) {
        const [hours, minutes] = data.dueTime.split(':');
        const dueDate = new Date(data.dueDate);
        dueDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        data.dueDate = dueDate.toISOString();
      }

      await onSubmit(data);
      
      // Show success notification
      await notificationService.showSuccessNotification(
        'Reminder Created',
        `${data.title} has been scheduled successfully!`
      );

      // Reset form
      reset();
      setDueDateBS('');
      setReminderDateBS('');
    } catch (error) {
      console.error('Error creating reminder:', error);
      await notificationService.showErrorNotification(
        'Error',
        'Failed to create reminder. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      medicine: '💊',
      appointment: '🏥',
      health_check: '🔬',
      vaccination: '💉',
      screening: '🔍',
      other: '📅'
    };
    return icons[type as keyof typeof icons] || '📅';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {mode === 'create' ? 'Create New Reminder' : 'Edit Reminder'}
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              {...register('title')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Refill blood pressure medication"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <select
              {...register('type')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="medicine">💊 Medicine</option>
              <option value="appointment">🏥 Appointment</option>
              <option value="health_check">🔬 Health Check</option>
              <option value="vaccination">💉 Vaccination</option>
              <option value="screening">🔍 Screening</option>
              <option value="other">📅 Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Additional details about this reminder..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </label>
            <div className="relative">
              <input
                type="date"
                {...register('dueDate')}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
            )}
            {dueDateBS && (
              <p className="mt-1 text-xs text-gray-500">
                BS: {dueDateBS}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Time
            </label>
            <div className="relative">
              <input
                type="time"
                {...register('dueTime')}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Clock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              {...register('priority')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Reminder Info */}
        {reminderDateBS && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-blue-500 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Reminder will be shown 5 days before due date
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Reminder Date: {reminderDateBS}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Type-specific fields */}
        {watchedType === 'medicine' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-3">💊 Medication Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">
                  Medication Name
                </label>
                <input
                  type="text"
                  {...register('medicationName')}
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Amlodipine"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">
                  Dosage
                </label>
                <input
                  type="text"
                  {...register('dosage')}
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 5mg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">
                  Frequency
                </label>
                <input
                  type="text"
                  {...register('frequency')}
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Once daily"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('prescriptionRefill')}
                  className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-green-700">Prescription refill reminder</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Remaining Days
                </label>
                <input
                  type="number"
                  {...register('remainingDays', { valueAsNumber: true })}
                  min="0"
                  className="w-20 px-2 py-1 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        )}

        {watchedType === 'appointment' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-3">🏥 Appointment Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Doctor Name
                </label>
                <input
                  type="text"
                  {...register('doctorName')}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Dr. Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  {...register('location')}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., City Hospital"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Appointment Type
              </label>
              <input
                type="text"
                {...register('appointmentType')}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Annual checkup, Follow-up"
              />
            </div>
          </div>
        )}

        {/* Advanced Options */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Plus className={`w-4 h-4 mr-2 transition-transform ${showAdvanced ? 'rotate-45' : ''}`} />
            Advanced Options
          </button>
        </div>

        {showAdvanced && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isRecurring')}
                  className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Recurring reminder</span>
              </label>
            </div>

            {watchedIsRecurring && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recurrence Type
                  </label>
                  <select
                    {...register('recurrenceType')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interval
                  </label>
                  <input
                    type="number"
                    {...register('recurrenceInterval', { valueAsNumber: true })}
                    min="1"
                    max="365"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                {...register('tags')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., important, monthly, health"
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate multiple tags with commas
              </p>
            </div>

            {watchedType === 'appointment' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Any special instructions or notes for this appointment..."
                />
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creating...' : mode === 'create' ? 'Create Reminder' : 'Update Reminder'}
          </button>
        </div>
      </form>
    </div>
  );
}
