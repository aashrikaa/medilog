import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .regex(/^[A-Za-z\s]+$/, 'Name must contain only letters and spaces'),
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .transform((v) => v.toLowerCase()),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  language: z.enum(['en', 'np']).default('en'),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, password, language } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      language,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Return user data (without password) and token
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      language: user.language,
      bloodType: user.bloodType,
      allergies: user.allergies,
      chronicConditions: user.chronicConditions,
      emergencyContacts: user.emergencyContacts,
    };

    return NextResponse.json({
      message: 'User registered successfully',
      user: userData,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
