'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Edit, Trash2, Filter, Search, Eye, Plus } from 'lucide-react';
import { formatADDate, getDaysUntil, isToday, isPast, isFuture } from '@/lib/calendar';
import notificationService from '@/lib/notifications';

interface Reminder {
  _id: string;
  title: string;
  description?: string;
  type: 'medicine' | 'appointment' | 'health_check' | 'vaccination' | 'screening' | 'other';
  category: 'medication' | 'appointment' | 'maintenance' | 'follow_up' | 'preventive';
  dueDate: string;
  dueDateBS?: string;
  reminderDate: string;
  reminderDateBS?: string;
  isRecurring: boolean;
  recurrenceType?: string;
  recurrenceInterval?: number;
  medicationName?: string;
  dosage?: string;
  frequency?: string;
  prescriptionRefill?: boolean;
  remainingDays?: number;
  doctorName?: string;
  location?: string;
  appointmentType?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  daysUntilDue: number;
  daysUntilReminder: number;
  shouldShowReminder: boolean;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface ReminderListProps {
  reminders: Reminder[];
  onEdit?: (reminder: Reminder) => void;
  onDelete?: (reminderId: string) => void;
  onComplete?: (reminderId: string) => void;
  onCreateNew?: () => void;
}

export default function ReminderList({
  reminders,
  onEdit,
  onDelete,
  onComplete,
  onCreateNew
}: ReminderListProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'calendar'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter and sort reminders
  const filteredReminders = reminders
    .filter(reminder => {
      const matchesSearch = reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           reminder.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           reminder.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || reminder.status === statusFilter;
      const matchesType = typeFilter === 'all' || reminder.type === typeFilter;
      const matchesPriority = priorityFilter === 'all' || reminder.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesType && matchesPriority;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

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

  const getStatusIcon = (status: string, isOverdue: boolean) => {
    if (isOverdue) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string, isOverdue: boolean) => {
    if (isOverdue) return 'bg-red-100 text-red-800';
    
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getDaysText = (days: number) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 0) return `${Math.abs(days)} days overdue`;
    return `${days} days`;
  };

  const handleComplete = async (reminderId: string) => {
    if (onComplete) {
      try {
        await onComplete(reminderId);
        await notificationService.showSuccessNotification(
          'Reminder Completed',
          'Reminder marked as completed successfully!'
        );
      } catch (error) {
        await notificationService.showErrorNotification(
          'Error',
          'Failed to mark reminder as completed.'
        );
      }
    }
  };

  const handleDelete = async (reminderId: string) => {
    if (onDelete) {
      try {
        await onDelete(reminderId);
        await notificationService.showSuccessNotification(
          'Reminder Deleted',
          'Reminder deleted successfully!'
        );
      } catch (error) {
        await notificationService.showErrorNotification(
          'Error',
          'Failed to delete reminder.'
        );
      }
    }
  };

  const ReminderCard = ({ reminder }: { reminder: Reminder }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getTypeIcon(reminder.type)}</span>
          <div>
            <h4 className="font-medium text-gray-900 line-clamp-2">{reminder.title}</h4>
            <p className="text-sm text-gray-500">{reminder.type.replace('_', ' ')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(reminder.priority)}`}>
            {reminder.priority}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reminder.status, reminder.isOverdue)}`}>
            {reminder.isOverdue ? 'Overdue' : reminder.status}
          </span>
        </div>
      </div>

      {reminder.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{reminder.description}</p>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Due: {formatADDate(new Date(reminder.dueDate))}</span>
          {reminder.dueDateBS && (
            <span className="ml-2 text-xs text-gray-500">({reminder.dueDateBS})</span>
          )}
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span className={reminder.isOverdue ? 'text-red-600 font-medium' : ''}>
            {getDaysText(reminder.daysUntilDue)}
          </span>
        </div>

        {reminder.medicationName && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Medication:</span> {reminder.medicationName}
            {reminder.dosage && ` - ${reminder.dosage}`}
            {reminder.frequency && ` (${reminder.frequency})`}
          </div>
        )}

        {reminder.doctorName && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Doctor:</span> {reminder.doctorName}
            {reminder.location && ` at ${reminder.location}`}
          </div>
        )}
      </div>

      {reminder.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {reminder.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          {reminder.status === 'pending' && (
            <button
              onClick={() => handleComplete(reminder._id)}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              Complete
            </button>
          )}
          
          {onEdit && (
            <button
              onClick={() => onEdit(reminder)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={() => handleDelete(reminder._id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center">
          {getStatusIcon(reminder.status, reminder.isOverdue)}
        </div>
      </div>
    </div>
  );

  const ReminderRow = ({ reminder }: { reminder: Reminder }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-xl mr-3">{getTypeIcon(reminder.type)}</span>
          <div>
            <div className="font-medium text-gray-900">{reminder.title}</div>
            <div className="text-sm text-gray-500">{reminder.type.replace('_', ' ')}</div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{formatADDate(new Date(reminder.dueDate))}</div>
        {reminder.dueDateBS && (
          <div className="text-xs text-gray-500">{reminder.dueDateBS}</div>
        )}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(reminder.priority)}`}>
          {reminder.priority}
        </span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reminder.status, reminder.isOverdue)}`}>
          {reminder.isOverdue ? 'Overdue' : reminder.status}
        </span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {getDaysText(reminder.daysUntilDue)}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          {reminder.status === 'pending' && (
            <button
              onClick={() => handleComplete(reminder._id)}
              className="text-green-600 hover:text-green-900"
            >
              Complete
            </button>
          )}
          
          {onEdit && (
            <button
              onClick={() => onEdit(reminder)}
              className="text-blue-600 hover:text-blue-900"
            >
              Edit
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={() => handleDelete(reminder._id)}
              className="text-red-600 hover:text-red-900"
            >
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Health Reminders</h2>
          <p className="text-gray-600">
            {filteredReminders.length} reminder{filteredReminders.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Reminder
            </button>
          )}
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search reminders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {showFilters && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="medicine">Medicine</option>
                  <option value="appointment">Appointment</option>
                  <option value="health_check">Health Check</option>
                  <option value="vaccination">Vaccination</option>
                  <option value="screening">Screening</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="createdAt">Created Date</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={sortOrder === 'asc'}
                  onChange={() => setSortOrder('asc')}
                  className="mr-2 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Ascending</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={sortOrder === 'desc'}
                  onChange={() => setSortOrder('desc')}
                  className="mr-2 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Descending</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setViewMode('list')}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            viewMode === 'list'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          List
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            viewMode === 'grid'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Grid
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            viewMode === 'calendar'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Calendar
        </button>
      </div>

      {/* Reminders Display */}
      {filteredReminders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reminders found</h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : 'Create your first reminder to get started!'}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reminder
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Left
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReminders.map((reminder) => (
                <ReminderRow key={reminder._id} reminder={reminder} />
              ))}
            </tbody>
          </table>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReminders.map((reminder) => (
            <ReminderCard key={reminder._id} reminder={reminder} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-center text-gray-500">
            Calendar view coming soon! This will show reminders in a monthly calendar format.
          </p>
        </div>
      )}
    </div>
  );
}
