"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Plus, X } from "lucide-react";
import ReminderForm from "@/components/ReminderForm";
import ReminderList from "@/components/ReminderList";
import notificationService from "@/lib/notifications";

interface Reminder {
	_id: string;
	title: string;
	description?: string;
	type:
		| "medicine"
		| "appointment"
		| "health_check"
		| "vaccination"
		| "screening"
		| "other";
	category:
		| "medication"
		| "appointment"
		| "maintenance"
		| "follow_up"
		| "preventive";
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
	status: "pending" | "completed" | "overdue" | "cancelled";
	priority: "low" | "medium" | "high" | "urgent";
	tags: string[];
	daysUntilDue: number;
	daysUntilReminder: number;
	shouldShowReminder: boolean;
	isOverdue: boolean;
	createdAt: string;
	updatedAt: string;
	completedAt?: string;
}

export default function RemindersPage() {
	const router = useRouter();
	const [reminders, setReminders] = useState<Reminder[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [editingReminder, setEditingReminder] =
		useState<Reminder | null>(null);
	const [upcomingReminders, setUpcomingReminders] = useState<
		Reminder[]
	>([]);

	// Check authentication
	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			router.push("/auth/login");
			return;
		}

		// Request notification permission
		notificationService.requestPermission();

		// Load reminders
		loadReminders();

		// Set up periodic checks for upcoming reminders
		const interval = setInterval(checkUpcomingReminders, 60000); // Check every minute

		return () => clearInterval(interval);
	}, [router]);

	const loadReminders = async () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) return;

			const response = await fetch("/api/reminders", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setReminders(data.reminders);
				checkUpcomingReminders(data.reminders);
			} else {
				console.error("Failed to load reminders");
			}
		} catch (error) {
			console.error("Error loading reminders:", error);
		} finally {
			setLoading(false);
		}
	};

	const checkUpcomingReminders = (remindersToCheck = reminders) => {
		const now = new Date();
		const upcoming = remindersToCheck.filter((reminder) => {
			if (reminder.status !== "pending") return false;

			const reminderDate = new Date(reminder.reminderDate);
			const dueDate = new Date(reminder.dueDate);

			// Show reminder if it's within the reminder window (5 days before due date)
			return now >= reminderDate && now <= dueDate;
		});

		setUpcomingReminders(upcoming);

		// Show notifications for new reminders
		if (upcoming.length > 0) {
			const notificationData = upcoming.map((reminder) => ({
				id: reminder._id,
				title: reminder.title,
				message:
					reminder.description ||
					`Due on ${new Date(reminder.dueDate).toLocaleDateString()}`,
				type: reminder.type,
				priority: reminder.priority,
				dueDate: new Date(reminder.dueDate),
				daysUntilDue: reminder.daysUntilDue,
				actionUrl: `/reminders/${reminder._id}`,
			}));

			notificationService.showReminderNotifications(notificationData);
		}
	};

	const handleCreateReminder = async (data: any) => {
		try {
			const token = localStorage.getItem("token");
			if (!token) return;

			const response = await fetch("/api/reminders", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(data),
			});

			if (response.ok) {
				await loadReminders();
				setShowForm(false);
			} else {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Failed to create reminder"
				);
			}
		} catch (error) {
			console.error("Error creating reminder:", error);
			throw error;
		}
	};

	const handleEditReminder = async (data: any) => {
		try {
			const token = localStorage.getItem("token");
			if (!token) return;

			const response = await fetch(
				`/api/reminders/${editingReminder?._id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(data),
				}
			);

			if (response.ok) {
				await loadReminders();
				setEditingReminder(null);
			} else {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Failed to update reminder"
				);
			}
		} catch (error) {
			console.error("Error updating reminder:", error);
			throw error;
		}
	};

	const handleDeleteReminder = async (reminderId: string) => {
		try {
			const token = localStorage.getItem("token");
			if (!token) return;

			const response = await fetch(`/api/reminders/${reminderId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				await loadReminders();
			} else {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Failed to delete reminder"
				);
			}
		} catch (error) {
			console.error("Error deleting reminder:", error);
			throw error;
		}
	};

	const handleCompleteReminder = async (reminderId: string) => {
		try {
			const token = localStorage.getItem("token");
			if (!token) return;

			const response = await fetch(
				`/api/reminders/${reminderId}/complete`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.ok) {
				await loadReminders();
			} else {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Failed to complete reminder"
				);
			}
		} catch (error) {
			console.error("Error completing reminder:", error);
			throw error;
		}
	};

	const handleEdit = (reminder: Reminder) => {
		setEditingReminder(reminder);
		setShowForm(true);
	};

	const handleCancelEdit = () => {
		setEditingReminder(null);
		setShowForm(false);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading reminders...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  ">
				{/* Upcoming Reminders Alert */}
				{upcomingReminders.length > 0 && (
					<div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<Bell className="w-5 h-5 text-blue-500 mr-3" />
								<div>
									<h3 className="text-sm font-medium text-blue-800">
										You have {upcomingReminders.length} upcoming
										reminder
										{upcomingReminders.length !== 1 ? "s" : ""}
									</h3>
									<p className="text-sm text-blue-600 mt-1">
										Check your notifications for details
									</p>
								</div>
							</div>
							<button
								onClick={() => setUpcomingReminders([])}
								className="text-blue-400 hover:text-blue-600"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
					</div>
				)}

				{/* Main Content */}
				{showForm ? (
					<div className="mb-8">
						<ReminderForm
							onSubmit={
								editingReminder
									? handleEditReminder
									: handleCreateReminder
							}
							initialData={editingReminder || undefined}
							onCancel={handleCancelEdit}
							mode={editingReminder ? "edit" : "create"}
						/>
					</div>
				) : (
					<ReminderList
						reminders={reminders}
						onEdit={handleEdit}
						onDelete={handleDeleteReminder}
						onComplete={handleCompleteReminder}
						onCreateNew={() => setShowForm(true)}
					/>
				)}

				{/* Quick Stats */}
				{!showForm && reminders.length > 0 && (
					<div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<div className="flex items-center">
								<div className="p-2 bg-blue-100 rounded-lg">
									<Bell className="w-6 h-6 text-blue-600" />
								</div>
								<div className="ml-4">
									<p className="text-sm font-medium text-gray-600">
										Total Reminders
									</p>
									<p className="text-2xl font-bold text-gray-900">
										{reminders.length}
									</p>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<div className="flex items-center">
								<div className="p-2 bg-green-100 rounded-lg">
									<Bell className="w-6 h-6 text-green-600" />
								</div>
								<div className="ml-4">
									<p className="text-sm font-medium text-gray-600">
										Pending
									</p>
									<p className="text-2xl font-bold text-gray-900">
										{
											reminders.filter((r) => r.status === "pending")
												.length
										}
									</p>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<div className="flex items-center">
								<div className="p-2 bg-yellow-100 rounded-lg">
									<Bell className="w-6 h-6 text-yellow-600" />
								</div>
								<div className="ml-4">
									<p className="text-sm font-medium text-gray-600">
										Due Soon
									</p>
									<p className="text-2xl font-bold text-gray-900">
										{
											reminders.filter(
												(r) =>
													r.daysUntilDue <= 7 &&
													r.status === "pending"
											).length
										}
									</p>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<div className="flex items-center">
								<div className="p-2 bg-red-100 rounded-lg">
									<Bell className="w-6 h-6 text-red-600" />
								</div>
								<div className="ml-4">
									<p className="text-sm font-medium text-gray-600">
										Overdue
									</p>
									<p className="text-2xl font-bold text-gray-900">
										{reminders.filter((r) => r.isOverdue).length}
									</p>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
