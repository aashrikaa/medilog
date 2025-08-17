import mongoose, { Schema, Document as MongoDocument } from 'mongoose';

export interface IReminder extends MongoDocument {
  userId: string;
  title: string;
  description?: string;
  type: 'medicine' | 'appointment' | 'health_check' | 'vaccination' | 'screening' | 'other';
  category: 'medication' | 'appointment' | 'maintenance' | 'follow_up' | 'preventive';
  
  // Date and Time
  dueDate: Date;
  dueDateBS?: string; // Bikram Sambat date
  reminderDate: Date; // When to start showing reminders (5 days before)
  reminderDateBS?: string;
  
  // Frequency and Recurrence
  isRecurring: boolean;
  recurrenceType?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  recurrenceInterval?: number;
  nextReminderDate?: Date;
  
  // Medicine-specific fields
  medicationName?: string;
  dosage?: string;
  frequency?: string;
  prescriptionRefill?: boolean;
  remainingDays?: number;
  
  // Appointment-specific fields
  doctorName?: string;
  location?: string;
  appointmentType?: string;
  notes?: string;
  
  // Status and Priority
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Notifications
  notificationsSent: string[];
  lastNotificationDate?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  tags: string[];
}

const reminderSchema = new Schema<IReminder>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['medicine', 'appointment', 'health_check', 'vaccination', 'screening', 'other'],
    required: true,
  },
  category: {
    type: String,
    enum: ['medication', 'appointment', 'maintenance', 'follow_up', 'preventive'],
    required: true,
  },
  
  // Date and Time
  dueDate: {
    type: Date,
    required: true,
    index: true,
  },
  dueDateBS: {
    type: String,
    trim: true,
  },
  reminderDate: {
    type: Date,
    required: true,
    index: true,
  },
  reminderDateBS: {
    type: String,
    trim: true,
  },
  
  // Frequency and Recurrence
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurrenceType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'],
  },
  recurrenceInterval: {
    type: Number,
    min: 1,
  },
  nextReminderDate: {
    type: Date,
  },
  
  // Medicine-specific fields
  medicationName: {
    type: String,
    trim: true,
  },
  dosage: {
    type: String,
    trim: true,
  },
  frequency: {
    type: String,
    trim: true,
  },
  prescriptionRefill: {
    type: Boolean,
    default: false,
  },
  remainingDays: {
    type: Number,
    min: 0,
  },
  
  // Appointment-specific fields
  doctorName: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  appointmentType: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  
  // Status and Priority
  status: {
    type: String,
    enum: ['pending', 'completed', 'overdue', 'cancelled'],
    default: 'pending',
    index: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  
  // Notifications
  notificationsSent: [{
    type: String,
  }],
  lastNotificationDate: {
    type: Date,
  },
  
  // Metadata
  tags: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

// Indexes for efficient querying
reminderSchema.index({ userId: 1, status: 1 });
reminderSchema.index({ userId: 1, dueDate: 1 });
reminderSchema.index({ userId: 1, reminderDate: 1 });
reminderSchema.index({ userId: 1, type: 1, status: 1 });

// Pre-save middleware to calculate reminder date (5 days before due date)
reminderSchema.pre('save', function(next) {
  if (this.isModified('dueDate') && !this.reminderDate) {
    const reminderDate = new Date(this.dueDate);
    reminderDate.setDate(reminderDate.getDate() - 5);
    this.reminderDate = reminderDate;
  }
  next();
});

// Virtual for days until due
reminderSchema.virtual('daysUntilDue').get(function() {
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for days until reminder
reminderSchema.virtual('daysUntilReminder').get(function() {
  const now = new Date();
  const reminder = new Date(this.reminderDate);
  const diffTime = reminder.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to check if reminder should be shown
reminderSchema.methods.shouldShowReminder = function() {
  const now = new Date();
  const reminderDate = new Date(this.reminderDate);
  const dueDate = new Date(this.dueDate);
  
  return now >= reminderDate && now <= dueDate && this.status === 'pending';
};

// Method to mark as completed
reminderSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Method to calculate next recurring date
reminderSchema.methods.calculateNextDate = function() {
  if (!this.isRecurring || !this.recurrenceType) return null;
  
  const currentDate = new Date(this.dueDate);
  let nextDate = new Date(currentDate);
  
  switch (this.recurrenceType) {
    case 'daily':
      nextDate.setDate(currentDate.getDate() + (this.recurrenceInterval || 1));
      break;
    case 'weekly':
      nextDate.setDate(currentDate.getDate() + (7 * (this.recurrenceInterval || 1)));
      break;
    case 'monthly':
      nextDate.setMonth(currentDate.getMonth() + (this.recurrenceInterval || 1));
      break;
    case 'yearly':
      nextDate.setFullYear(currentDate.getFullYear() + (this.recurrenceInterval || 1));
      break;
  }
  
  return nextDate;
};

const Reminder = mongoose.models.Reminder || mongoose.model<IReminder>('Reminder', reminderSchema);

export default Reminder;
