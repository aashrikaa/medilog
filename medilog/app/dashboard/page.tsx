"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	Upload,
	Search,
	FileText,
	BarChart3,
	User,
	Settings,
	LogOut,
	Plus,
	Filter,
	Download,
	Trash2,
	Eye,
	Bell,
} from "lucide-react";
import { cn, formatFileSize, formatDate } from "@/lib/utils";
import DocumentUpload from "@/components/DocumentUpload";
import DocumentList from "@/components/DocumentList";
import HealthInsights from "@/components/HealthInsights";
import SearchFilters from "@/components/SearchFilters";
import RemindersPage from "@/components/reminder";

interface User {
	_id: string;
	name: string;
	email: string;
	language: "en" | "np";
	bloodType?: string;
	allergies?: string[];
	chronicConditions?: string[];
}

interface Document {
	_id: string;
	filename: string;
	originalName: string;
	category: string;
	fileType: string;
	tags: string[];
	uploadDate: string;
	fileSize: number;
	summary?: string;
	labValuesCount?: number;
}

export default function Dashboard() {
	const [user, setUser] = useState<User | null>(null);
	const [documents, setDocuments] = useState<Document[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("documents");
	const [showUpload, setShowUpload] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] =
		useState<string>("");
	const [selectedDocuments, setSelectedDocuments] = useState<
		string[]
	>([]);
	const [showAdvancedFilters, setShowAdvancedFilters] =
		useState(false);
	const [dateFilter, setDateFilter] = useState<
		"all" | "today" | "week" | "month"
	>("all");
	const [fileTypeFilter, setFileTypeFilter] = useState<
		"all" | "lab" | "non-lab"
	>("all");

	const router = useRouter();

	useEffect(() => {
		// Check authentication
		const token = localStorage.getItem("token");
		const userData = localStorage.getItem("user");

		if (!token || !userData) {
			router.push("/");
			return;
		}

		try {
			setUser(JSON.parse(userData));
			fetchDocuments();
		} catch (error) {
			console.error("Error parsing user data:", error);
			router.push("/");
		}
	}, [router]);

	const fetchDocuments = async () => {
		try {
			const token = localStorage.getItem("token");
			const response = await fetch("/api/documents", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setDocuments(data.documents);
			}
		} catch (error) {
			console.error("Error fetching documents:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		router.push("/");
	};

	const handleDocumentUpload = (newDocument: Document) => {
		setDocuments((prev) => [newDocument, ...prev]);
		setShowUpload(false);
	};

	const handleBulkAction = async (action: string) => {
		if (selectedDocuments.length === 0) return;

		try {
			const token = localStorage.getItem("token");

			if (action === "delete") {
				const confirmed = confirm(
					`Are you sure you want to delete ${selectedDocuments.length} document(s)?`
				);
				if (!confirmed) return;

				await Promise.all(
					selectedDocuments.map((id) =>
						fetch(`/api/documents/${id}`, {
							method: "DELETE",
							headers: { Authorization: `Bearer ${token}` },
						})
					)
				);

				setDocuments((prev) =>
					prev.filter((doc) => !selectedDocuments.includes(doc._id))
				);
				setSelectedDocuments([]);
			}
		} catch (error) {
			console.error("Bulk action error:", error);
		}
	};

	const filteredDocuments = documents.filter((doc) => {
		const matchesSearch =
			doc.originalName
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			doc.tags.some((tag) =>
				tag.toLowerCase().includes(searchQuery.toLowerCase())
			) ||
			doc.category.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory =
			!selectedCategory || doc.category === selectedCategory;

		// Date filtering
		let matchesDate = true;
		if (dateFilter !== "all") {
			const docDate = new Date(doc.uploadDate);
			const now = new Date();
			const diffTime = Math.abs(now.getTime() - docDate.getTime());
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

			switch (dateFilter) {
				case "today":
					matchesDate = diffDays <= 1;
					break;
				case "week":
					matchesDate = diffDays <= 7;
					break;
				case "month":
					matchesDate = diffDays <= 30;
					break;
			}
		}

		// File type filtering
		let matchesFileType = true;
		if (fileTypeFilter !== "all") {
			if (fileTypeFilter === "lab") {
				matchesFileType = doc.category === "Lab Reports";
			} else {
				matchesFileType = doc.category !== "Lab Reports";
			}
		}

		return (
			matchesSearch &&
			matchesCategory &&
			matchesDate &&
			matchesFileType
		);
	});

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">
						Loading your dashboard...
					</p>
				</div>
			</div>
		);
	}

	if (!user) return null;

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-4">
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
								<FileText className="w-6 h-6 text-white" />
							</div>
							<h1 className="text-2xl font-bold text-gray-900">
								MediLog
							</h1>
						</div>

						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-2">
								<User className="w-5 h-5 text-gray-400" />
								<span className="text-gray-700">{user.name}</span>
							</div>
							<button
								onClick={() => setShowUpload(true)}
								className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
							>
								<Plus className="w-4 h-4 mr-2 inline" />
								Upload Document
							</button>
							<button
								onClick={handleLogout}
								className="text-gray-600 hover:text-gray-800 transition-colors"
							>
								<LogOut className="w-5 h-5" />
							</button>
						</div>
					</div>
				</div>
			</header>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Search and Filters */}
				<div className="mb-8">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
								<input
									type="text"
									placeholder="Search documents, tags, or content..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
								/>
							</div>
						</div>
						<select
							value={selectedCategory}
							onChange={(e) => setSelectedCategory(e.target.value)}
							className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
						>
							<option value="">All Categories</option>
							<option value="Lab Reports">Lab Reports</option>
							<option value="Prescriptions">Prescriptions</option>
							<option value="Imaging">Imaging</option>
							<option value="Other">Other</option>
						</select>
						<button
							onClick={() =>
								setShowAdvancedFilters(!showAdvancedFilters)
							}
							className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
						>
							<Filter className="w-4 h-4 mr-2 inline" />
							Advanced
						</button>
					</div>

					{/* Advanced Filters */}
					{showAdvancedFilters && (
						<div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Date Range
									</label>
									<select
										value={dateFilter}
										onChange={(e) =>
											setDateFilter(e.target.value as any)
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
									>
										<option value="all">All Time</option>
										<option value="today">Today</option>
										<option value="week">This Week</option>
										<option value="month">This Month</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										File Type
									</label>
									<select
										value={fileTypeFilter}
										onChange={(e) =>
											setFileTypeFilter(e.target.value as any)
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
									>
										<option value="all">All Files</option>
										<option value="lab">Lab Reports Only</option>
										<option value="non-lab">Non-Lab Files</option>
									</select>
								</div>

								<div className="flex items-end">
									<button
										onClick={() => {
											setSearchQuery("");
											setSelectedCategory("");
											setDateFilter("all");
											setFileTypeFilter("all");
										}}
										className="w-full px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
									>
										Clear Filters
									</button>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Bulk Actions */}
				{selectedDocuments.length > 0 && (
					<div className="mb-6 bg-white rounded-lg p-4 border border-gray-200">
						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-600">
								{selectedDocuments.length} document(s) selected
							</span>
							<div className="flex space-x-2">
								<button
									onClick={() => handleBulkAction("download")}
									className="flex items-center px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded"
								>
									<Download className="w-4 h-4 mr-1" />
									Download
								</button>
								<button
									onClick={() => handleBulkAction("delete")}
									className="flex items-center px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
								>
									<Trash2 className="w-4 h-4 mr-1" />
									Delete
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Tabs */}
				<div className="mb-6">
					<nav className="flex space-x-8">
						<button
							onClick={() => setActiveTab("documents")}
							className={cn(
								"py-2 px-1 border-b-2 font-medium text-sm",
								activeTab === "documents"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							)}
						>
							Documents ({filteredDocuments.length})
						</button>
						<button
							onClick={() => setActiveTab("reminders")}
							className={cn(
								"py-2 px-1 border-b-2 font-medium text-sm",
								activeTab === "reminders"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							)}
						>
							Reminders
						</button>
						<button
							onClick={() => setActiveTab("insights")}
							className={cn(
								"py-2 px-1 border-b-2 font-medium text-sm",
								activeTab === "insights"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							)}
						>
							Health Insights
						</button>
					</nav>
				</div>

				{/* Content */}
				{activeTab === "documents" && (
					<DocumentList
						documents={documents}
						selectedDocuments={selectedDocuments}
						onSelectionChange={setSelectedDocuments}
						onDocumentUpdate={fetchDocuments}
					/>
				)}

				{activeTab === "reminders" && <RemindersPage />}

				{activeTab === "insights" && (
					<HealthInsights documents={documents} />
				)}
			</div>

			{/* Document Upload Modal */}
			{showUpload && (
				<DocumentUpload
					onClose={() => setShowUpload(false)}
					onUpload={handleDocumentUpload}
					userLanguage={user.language}
				/>
			)}
		</div>
	);
}
