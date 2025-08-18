import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/database";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { z } from "zod";

const loginSchema = z.object({
	email: z
		.string()
		.trim()
		.email("Invalid email address")
		.transform((v) => v.toLowerCase()),
	password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
	try {
		await connectDB();

		const body = await request.json();
		const { email, password } = loginSchema.parse(body);

		// Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			return NextResponse.json(
				{ error: "There is no account associated with this email." },
				{ status: 401 }
			);
		}

		// Verify password
		const isPasswordValid = await user.comparePassword(password);
		if (!isPasswordValid) {
			return NextResponse.json(
				{ error: "Password Incorrect." },
				{ status: 401 }
			);
		}

		// Generate JWT token
		const token = jwt.sign(
			{ userId: user._id, email: user.email },
			process.env.JWT_SECRET!,
			{ expiresIn: "7d" }
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
			message: "Login successful",
			user: userData,
			token,
		});
	} catch (error) {
		console.error("Login error:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Validation failed", details: error.errors },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
