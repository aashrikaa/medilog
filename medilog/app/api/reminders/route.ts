import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Reminder from '@/models/Reminder';
import { verifyToken } from '@/lib/auth';
import { convertToBS } from '@/lib/calendar';

export async function POST(request: NextRequest) {
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

    // Validate required fields
    if (!title || !type || !category || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields: title, type, category, dueDate' },
        { status: 400 }
      );
    }

    // Calculate reminder date (5 days before due date)
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - 5);

    // Convert to BS dates
    const dueDateBS = convertToBS(new Date(dueDate));
    const reminderDateBS = convertToBS(reminderDate);

    // Create reminder
    const reminder = new Reminder({
      userId: decoded.userId,
      title,
      description,
      type,
      category,
      dueDate: new Date(dueDate),
      dueDateBS,
      reminderDate,
      reminderDateBS,
      isRecurring: isRecurring || false,
      recurrenceType,
      recurrenceInterval,
      medicationName,
      dosage,
      frequency,
      prescriptionRefill: prescriptionRefill || false,
      remainingDays,
      doctorName,
      location,
      appointmentType,
      notes,
      priority: priority || 'medium',
      tags: tags || [],
      status: 'pending'
    });

    await reminder.save();

    return NextResponse.json({
      message: 'Reminder created successfully',
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
    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const upcoming = searchParams.get('upcoming'); // Show only upcoming reminders

    // Build query
    let query: any = { userId: decoded.userId };

    if (status) query.status = status;
    if (type) query.type = type;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    // If upcoming is true, show only reminders that are due in the future
    if (upcoming === 'true') {
      query.dueDate = { $gte: new Date() };
    }

    // Get reminders
    const reminders = await Reminder.find(query)
      .sort({ dueDate: 1, priority: -1 })
      .lean();

    // Calculate additional fields
    const remindersWithCalculations = reminders.map(reminder => {
      const now = new Date();
      const dueDate = new Date(reminder.dueDate);
      const reminderDate = new Date(reminder.reminderDate);
      
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const daysUntilReminder = Math.ceil((reminderDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      const shouldShowReminder = now >= reminderDate && now <= dueDate && reminder.status === 'pending';
      const isOverdue = now > dueDate && reminder.status === 'pending';
      
      return {
        ...reminder,
        daysUntilDue,
        daysUntilReminder,
        shouldShowReminder,
        isOverdue
      };
    });

    return NextResponse.json({
      reminders: remindersWithCalculations,
      total: remindersWithCalculations.length
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}
