import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Reminder from '@/models/Reminder';
import { verifyToken } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    // Find the reminder and verify ownership
    const reminder = await Reminder.findOne({ _id: params.id, userId: decoded.userId });
    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    // Check if reminder is already completed
    if (reminder.status === 'completed') {
      return NextResponse.json({ error: 'Reminder is already completed' }, { status: 400 });
    }

    // Mark as completed
    reminder.status = 'completed';
    reminder.completedAt = new Date();

    // If it's a recurring reminder, create the next one
    if (reminder.isRecurring && reminder.recurrenceType) {
      const nextDate = reminder.calculateNextDate();
      if (nextDate) {
        // Create next recurring reminder
        const nextReminder = new Reminder({
          userId: reminder.userId,
          title: reminder.title,
          description: reminder.description,
          type: reminder.type,
          category: reminder.category,
          dueDate: nextDate,
          dueDateBS: reminder.dueDateBS, // Will be recalculated by pre-save middleware
          reminderDate: new Date(nextDate.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days before
          reminderDateBS: reminder.reminderDateBS, // Will be recalculated by pre-save middleware
          isRecurring: reminder.isRecurring,
          recurrenceType: reminder.recurrenceType,
          recurrenceInterval: reminder.recurrenceInterval,
          medicationName: reminder.medicationName,
          dosage: reminder.dosage,
          frequency: reminder.frequency,
          prescriptionRefill: reminder.prescriptionRefill,
          remainingDays: reminder.remainingDays,
          doctorName: reminder.doctorName,
          location: reminder.location,
          appointmentType: reminder.appointmentType,
          notes: reminder.notes,
          priority: reminder.priority,
          tags: reminder.tags,
          status: 'pending'
        });

        await nextReminder.save();
      }
    }

    await reminder.save();

    return NextResponse.json({
      message: 'Reminder marked as completed successfully',
      reminder: {
        _id: reminder._id,
        title: reminder.title,
        status: reminder.status,
        completedAt: reminder.completedAt
      }
    });
  } catch (error) {
    console.error('Error completing reminder:', error);
    return NextResponse.json(
      { error: 'Failed to complete reminder' },
      { status: 500 }
    );
  }
}
