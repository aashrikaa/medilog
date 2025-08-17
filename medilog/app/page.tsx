"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Eye,
	EyeOff,
	Upload,
	Shield,
	Brain,
	BarChart3,
	Search,
	FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
	const [isLogin, setIsLogin] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		language: "en",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			const endpoint = isLogin
				? "/api/auth/login"
				: "/api/auth/register";
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Authentication failed");
			}

			// Store token and user data
			localStorage.setItem("token", data.token);
			localStorage.setItem("user", JSON.stringify(data.user));

			// Redirect to dashboard
			router.push("/dashboard");
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "An error occurred"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
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
							<button
								onClick={() => setIsLogin(!isLogin)}
								className="text-primary-600 hover:text-primary-700 font-medium"
							>
								{isLogin ? "Create Account" : "Sign In"}
							</button>
						</div>
					</div>
				</div>
			</header>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="grid lg:grid-cols-2 gap-12 items-center">
					{/* Left side - Features */}
					<div className="space-y-8">
						<div>
							<h2 className="text-4xl font-bold text-gray-900 mb-4">
								Secure Medical Document Management
							</h2>
							<p className="text-xl text-gray-600 leading-relaxed">
								Store, organize, and analyze your medical documents
								with AI-powered insights. Get instant lab value
								extraction and health trend analysis.
							</p>
						</div>

						<div className="grid grid-cols-2 gap-6">
							<div className="flex items-start space-x-3">
								<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
									<Upload className="w-5 h-5 text-blue-600" />
								</div>
								<div>
									<h3 className="font-semibold text-gray-900">
										Smart Upload
									</h3>
									<p className="text-sm text-gray-600">
										AI-powered PDF processing
									</p>
								</div>
							</div>

							<div className="flex items-start space-x-3">
								<div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
									<Brain className="w-5 h-5 text-green-600" />
								</div>
								<div>
									<h3 className="font-semibold text-gray-900">
										AI Analysis
									</h3>
									<p className="text-sm text-gray-600">
										Extract lab values automatically
									</p>
								</div>
							</div>

							<div className="flex items-start space-x-3">
								<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
									<BarChart3 className="w-5 h-5 text-purple-600" />
								</div>
								<div>
									<h3 className="font-semibold text-gray-900">
										Health Trends
									</h3>
									<p className="text-sm text-gray-600">
										Track your health over time
									</p>
								</div>
							</div>

							<div className="flex items-start space-x-3">
								<div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
									<Shield className="w-5 h-5 text-red-600" />
								</div>
								<div>
									<h3 className="font-semibold text-gray-900">
										Secure Storage
									</h3>
									<p className="text-sm text-gray-600">
										End-to-end encryption
									</p>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
							<h3 className="font-semibold text-gray-900 mb-3">
								Key Features
							</h3>
							<ul className="space-y-2 text-sm text-gray-600">
								<li>• PDF medical document upload & storage</li>
								<li>• AI-powered lab value extraction</li>
								<li>• Advanced search & categorization</li>
								<li>• Health trend visualization</li>
								<li>• Dual language support (English/Nepali)</li>
								<li>• QR health summary generation</li>
							</ul>
						</div>
					</div>

					{/* Right side - Auth Form */}
					<div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
						<div className="text-center mb-8">
							<h3 className="text-2xl font-bold text-gray-900">
								{isLogin ? "Welcome Back" : "Create Your Account"}
							</h3>
							<p className="text-gray-600 mt-2">
								{isLogin
									? "Sign in to access your medical documents"
									: "Start managing your health records securely"}
							</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-6">
							{!isLogin && (
								<div>
									<label
										htmlFor="name"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Full Name
									</label>
									<input
										type="text"
										id="name"
										value={formData.name}
										onChange={(e) =>
											handleInputChange("name", e.target.value)
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
										placeholder="Enter your full name"
										required={!isLogin}
									/>
								</div>
							)}

							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Email Address
								</label>
								<input
									type="email"
									id="email"
									value={formData.email}
									onChange={(e) =>
										handleInputChange("email", e.target.value)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
									placeholder="Enter your email"
									required
								/>
							</div>

							<div>
								<label
									htmlFor="password"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Password
								</label>
								<div className="relative">
									<input
										type={showPassword ? "text" : "password"}
										id="password"
										value={formData.password}
										onChange={(e) =>
											handleInputChange("password", e.target.value)
										}
										className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
										placeholder="Enter your password"
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute inset-y-0 right-0 pr-3 flex items-center"
									>
										{showPassword ? (
											<EyeOff className="h-5 w-5 text-gray-400" />
										) : (
											<Eye className="h-5 w-5 text-gray-400" />
										)}
									</button>
								</div>
							</div>

							{!isLogin && (
								<div>
									<label
										htmlFor="language"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Preferred Language
									</label>
									<select
										id="language"
										value={formData.language}
										onChange={(e) =>
											handleInputChange("language", e.target.value)
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
									>
										<option value="en">English</option>
										<option value="np">नेपाली (Nepali)</option>
									</select>
								</div>
							)}

							{error && (
								<div className="bg-red-50 border border-red-200 rounded-lg p-3">
									<p className="text-sm text-red-600">{error}</p>
								</div>
							)}

							<button
								type="submit"
								disabled={isLoading}
								className={cn(
									"w-full py-3 px-4 rounded-lg font-medium text-white transition-colors duration-200",
									isLoading
										? "bg-gray-400 cursor-not-allowed"
										: "bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
								)}
							>
								{isLoading
									? "Processing..."
									: isLogin
									? "Sign In"
									: "Create Account"}
							</button>
						</form>

						<div className="mt-6 text-center">
							<p className="text-sm text-gray-600">
								{isLogin
									? "Don't have an account? "
									: "Already have an account? "}
								<button
									onClick={() => setIsLogin(!isLogin)}
									className="text-primary-600 hover:text-primary-700 font-medium"
								>
									{isLogin ? "Sign up" : "Sign in"}
								</button>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
