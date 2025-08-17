import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Reminder from '@/models/Reminder';
import { verifyToken } from '@/lib/auth';
import { convertToBS } from '@/lib/calendar';

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

    const body = await request.json();
    const {
      title,
      description,
      type,
      category,
      dueDate,
      isRecurring,
      recurrenceType,
      recurrenceInterval,
      medicationName,
      dosage,
      frequency,
      prescriptionRefill,
      remainingDays,
      doctorName,
      location,
      appointmentType,
      notes,
      priority,
      tags
    } = body;

    // Find the reminder and verify ownership
    const reminder = await Reminder.findOne({ _id: params.id, userId: decoded.userId });
    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    // Update fields
    if (title !== undefined) reminder.title = title;
    if (description !== undefined) reminder.description = description;
    if (type !== undefined) reminder.type = type;
    if (category !== undefined) reminder.category = category;
    if (dueDate !== undefined) {
      reminder.dueDate = new Date(dueDate);
      // Recalculate reminder date (5 days before due date)
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(reminderDate.getDate() - 5);
      reminder.reminderDate = reminderDate;
      
      // Update BS dates
      reminder.dueDateBS = convertToBS(new Date(dueDate));
      reminder.reminderDateBS = convertToBS(reminderDate);
    }
    if (isRecurring !== undefined) reminder.isRecurring = isRecurring;
    if (recurrenceType !== undefined) reminder.recurrenceType = recurrenceType;
    if (recurrenceInterval !== undefined) reminder.recurrenceInterval = recurrenceInterval;
    if (medicationName !== undefined) reminder.medicationName = medicationName;
    if (dosage !== undefined) reminder.dosage = dosage;
    if (frequency !== undefined) reminder.frequency = frequency;
    if (prescriptionRefill !== undefined) reminder.prescriptionRefill = prescriptionRefill;
    if (remainingDays !== undefined) reminder.remainingDays = remainingDays;
    if (doctorName !== undefined) reminder.doctorName = doctorName;
    if (location !== undefined) reminder.location = location;
    if (appointmentType !== undefined) reminder.appointmentType = appointmentType;
    if (notes !== undefined) reminder.notes = notes;
    if (priority !== undefined) reminder.priority = priority;
    if (tags !== undefined) reminder.tags = tags;

    await reminder.save();

    return NextResponse.json({
      message: 'Reminder updated successfully',
      reminder: {
        _id: reminder._id,
        title: reminder.title,
        type: reminder.type,
        category: reminder.category,
        dueDate: reminder.dueDate,
        dueDateBS: reminder.dueDateBS,
        reminderDate: reminder.reminderDate,
        reminderDateBS: reminder.reminderDateBS,
        status: reminder.status,
        priority: reminder.priority
      }
    });
  } catch (error) {
    console.error('Error updating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to update reminder' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Find and delete the reminder, verifying ownership
    const reminder = await Reminder.findOneAndDelete({ _id: params.id, userId: decoded.userId });
    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    );
  }
}
