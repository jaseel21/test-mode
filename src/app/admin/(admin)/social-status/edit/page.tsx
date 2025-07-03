"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    Upload,
    Save,
    X,
    Loader2,
    FileText,
    Image as ImageIcon,
    Film,
    Info,
    Plus,
    Check,
    AlertCircle,
    Layers,
    Calendar,
    Star,
    Eye,
    EyeOff,
    SlidersHorizontal,
    Palette,
    Hash,
    Users,
    Clock,
    HelpCircle,
    Sparkles,
    Zap,
    TrendingUp,
    BarChart3,
    Medal,
    ExternalLink
} from "lucide-react";
import { useStatusStore } from "@/store/statusStore";
import { Status } from "@/lib/types";

// Define form errors interface
interface FormErrors {
    content?: string;
    mediaFile?: string;
    category?: string;
    submit?: string;
    fetch?: string;
}

// Define performance data interface
interface PerformanceData {
    views: number;
    engagementRate: string;
    activeDays: number;
    weeklyData: {
        day: string;
        count: number;
    }[];
}

export default function EditStatusPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const statusId = searchParams.get('id');
    const { updateStatus, fetchStatuses, fetchCategories, categories, statuses } = useStatusStore();

    // Form state
    const [content, setContent] = useState("");
    const [type, setType] = useState<"text" | "image" | "video">("text");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [backgroundColor, setBackgroundColor] = useState("#111827");
    const [textColor, setTextColor] = useState("#ffffff");
    const [fontFamily, setFontFamily] = useState("Inter");
    const [fontSize, setFontSize] = useState(24);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [currentMediaUrl, setCurrentMediaUrl] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [featured, setFeatured] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [usageCount, setUsageCount] = useState(0);
    const [createdAt, setCreatedAt] = useState<Date | null>(null);

    // Performance data
    const [performanceData, setPerformanceData] = useState<PerformanceData>({
        views: 0,
        engagementRate: "0%",
        activeDays: 0,
        weeklyData: []
    });

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState<FormErrors>({});
    const [showBgPalette, setShowBgPalette] = useState(false);
    const [showTextPalette, setShowTextPalette] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [previewStep, setPreviewStep] = useState(1);
    const [activeSection, setActiveSection] = useState("main"); // main, styling, settings
    const [showPreview, setShowPreview] = useState(false);
    const [showSaveNotification, setShowSaveNotification] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLTextAreaElement>(null);

    // Predefined color palettes
    const backgroundPalette = [
        "#111827", "#1F2937", "#374151", // Dark grays
        "#0F172A", "#1E3A8A", "#1D4ED8", // Blues
        "#0F766E", "#065F46", "#064E3B", // Greens
        "#7E22CE", "#6D28D9", "#581C87", // Purples
        "#9D174D", "#BE185D", "#831843", // Pinks
        "#B91C1C", "#991B1B", "#7F1D1D", // Reds
        "#92400E", "#B45309", "#78350F", // Oranges
        "#FFFFFF", "#F9FAFB", "#F3F4F6", // Light grays
    ];

    const textPalette = [
        "#FFFFFF", "#F9FAFB", "#F3F4F6", // Light colors
        "#E5E7EB", "#D1D5DB", "#9CA3AF", // Grays
        "#60A5FA", "#93C5FD", "#BFDBFE", // Blues
        "#34D399", "#6EE7B7", "#A7F3D0", // Greens
        "#A78BFA", "#C4B5FD", "#DDD6FE", // Purples
        "#F472B6", "#FBCFE8", "#FCE7F3", // Pinks
        "#F87171", "#FCA5A5", "#FECACA", // Reds
        "#000000", "#111827", "#1F2937", // Dark colors
    ];

    useEffect(() => {
        const fetchStatusData = async () => {
            if (!statusId) {
                router.push("/admin/social-status/all");
                return;
            }

            try {
                setIsLoading(true);

                // Fetch categories
                await fetchCategories();

                // Try to find status in store first
                if (statuses.length === 0) {
                    await fetchStatuses();
                }

                const status = statuses.find((s) => s._id === statusId);

                if (status) {
                    initializeFormWithStatus(status);
                    fetchPerformanceData(status);
                } else {
                    // Fetch the specific status if not in store
                    const response = await fetch(`/api/statuses/${statusId}`);
                    const data = await response.json();

                    if (data.success) {
                        initializeFormWithStatus(data.data);
                        fetchPerformanceData(data.data);
                    } else {
                        throw new Error(data.message || "Failed to fetch status");
                    }
                }
            } catch (error) {
                console.error("Error fetching status:", error);
                setErrors({
                    fetch: error instanceof Error ? error.message : "An unknown error occurred",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchStatusData();
    }, [statusId, statuses, fetchStatuses, fetchCategories, router]);

    // Auto-hide the save notification after 3 seconds
    useEffect(() => {
        if (showSaveNotification) {
            const timer = setTimeout(() => {
                setShowSaveNotification(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSaveNotification]);

    const initializeFormWithStatus = (status: Status) => {
        setContent(status.content);
        setType(status.type);
        setCategory(status.category);
        setTags(status.tags || []);
        setUsageCount(status.usageCount || 0);

        if (status.createdAt) {
            setCreatedAt(new Date(status.createdAt));
        }

        if (status.type === 'text') {
            setBackgroundColor(status.backgroundColor || '#111827');
            setTextColor(status.textColor || '#ffffff');
            setFontFamily(status.fontFamily || 'Inter');
            setFontSize(status.fontSize || 24);
        }

        if (status.mediaUrl) {
            setCurrentMediaUrl(status.mediaUrl);
            setPreviewUrl(status.mediaUrl);
        }

        setFeatured(status.featured);
        setIsActive(status.isActive);
    };

    const fetchPerformanceData = (status: Status) => {
        // Generate more realistic performance data based on status attributes
        const usageStat = status.usageCount || 0;
        const daysSinceCreation = status.createdAt ?
            Math.floor((new Date().getTime() - new Date(status.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 7;

        // Generate daily data for the past week with a realistic distribution
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date().getDay();
        const weekData = [];

        for (let i = 6; i >= 0; i--) {
            const dayIndex = (today - i + 7) % 7;
            const day = weekdays[dayIndex];

            // Create a realistic distribution with higher usage on weekdays
            let dailyUsage = 0;
            if (usageStat > 0) {
                // Base distribution influenced by day of week (higher mid-week)
                const dayFactor = dayIndex >= 1 && dayIndex <= 5 ? 1.5 : 0.7;
                // Calculate percentage of total usage for this day with some randomness
                const percentage = (dayFactor * (Math.random() * 0.3 + 0.7)) / 7;
                dailyUsage = Math.max(0, Math.round(usageStat * percentage));
            }

            weekData.push({
                day,
                count: dailyUsage
            });
        }

        // Calculate engagement rate based on usage and status age
        const engagementRate = daysSinceCreation > 0
            ? ((usageStat / daysSinceCreation) * (status.featured ? 1.5 : 1)).toFixed(1)
            : "0.0";

        // Estimate views based on usage count with a realistic multiplier
        const estimatedViews = Math.floor(usageStat * (Math.random() * 6 + 5)); // 5-10x more views than usage

        setPerformanceData({
            views: estimatedViews,
            engagementRate: `${engagementRate}%`,
            activeDays: Math.min(daysSinceCreation, Math.floor(usageStat * 0.8) + 1),
            weeklyData: weekData
        });
    };

    const handleBrowseClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        // const fileType = file.type.split('/')[0]; // 'image' or 'video'

        // Validate file type
        if (
            (type === 'image' && !file.type.startsWith('image/')) ||
            (type === 'video' && !file.type.startsWith('video/'))
        ) {
            setErrors({
                ...errors,
                mediaFile: `Please upload a valid ${type} file`
            });
            return;
        }

        // Validate file size (15MB limit)
        if (file.size > 15 * 1024 * 1024) {
            setErrors({
                ...errors,
                mediaFile: `${type} size must be less than 15MB`
            });
            return;
        }

        // Clear errors if validation passes
        const newErrors = { ...errors };
        delete newErrors.mediaFile;
        setErrors(newErrors);

        setMediaFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleTagAdd = () => {
        if (!tagInput.trim()) return;

        const newTag = tagInput.trim().toLowerCase();

        // Don't add duplicate tags
        if (!tags.includes(newTag)) {
            setTags([...tags, newTag]);
        }

        setTagInput("");
    };

    const handleTagRemove = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!content.trim()) {
            newErrors.content = "Content is required";
        }

        if (!category) {
            newErrors.category = "Category is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm() || !statusId) return;

        setIsSubmitting(true);
        setErrors({});

        try {
            const formData = new FormData();
            formData.append("content", content);
            formData.append("type", type);
            formData.append("category", category);
            formData.append("tags", JSON.stringify(tags));

            if (type === 'text') {
                formData.append("backgroundColor", backgroundColor);
                formData.append("textColor", textColor);
                formData.append("fontFamily", fontFamily);
                formData.append("fontSize", fontSize.toString());
            }

            if (mediaFile) {
                formData.append("mediaFile", mediaFile);
            }

            if (currentMediaUrl) {
                formData.append("currentMediaUrl", currentMediaUrl);
            }

            formData.append("featured", featured.toString());
            formData.append("isActive", isActive.toString());

            const response = await fetch(`/api/statuses/${statusId}`, {
                method: "PUT",
                body: formData,
                headers: {
                    'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
                },
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update status");
            }

            updateStatus(data.data);
            setShowSaveNotification(true);
            setTimeout(() => {
                router.push("/admin/social-status/all");
            }, 1000);
        } catch (error) {
            console.error("Error updating status:", error);
            setErrors({
                submit: error instanceof Error ? error.message : "An unknown error occurred",
            });
            window.scrollTo(0, 0);
        } finally {
            setIsSubmitting(false);
        }
    };

    const cyclePreviewStep = () => {
        setPreviewStep(prev => (prev % 3) + 1);
    };

    const getPreviewStepLabel = () => {
        switch (previewStep) {
            case 1: return "Desktop View";
            case 2: return "Mobile View";
            case 3: return "Feed Preview";
            default: return "Preview";
        }
    };

    const handleCharacterCount = () => {
        const count = content.length;
        if (count < 80) return 'text-emerald-500';
        if (count < 120) return 'text-amber-500';
        return 'text-red-500';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center flex flex-col items-center">
                    <div className="relative w-16 h-16">
                        <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                        <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-emerald-500 animate-spin"></div>
                    </div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300 animate-pulse">Loading status...</p>
                </div>
            </div>
        );
    }

    if (errors.fetch) {
        return (
            <div className="p-4 md:p-6 flex justify-center items-center min-h-[400px]">
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-red-300 dark:border-red-900/50 shadow-lg p-8 max-w-md w-full text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3">
                            <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Error Loading Status</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">{errors.fetch}</p>
                    <Link href="/admin/social-status/all" className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center mx-auto w-fit">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Return to All Statuses
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6 max-w-7xl mx-auto">
            {showSaveNotification && (
                <div className="fixed top-4 right-4 bg-emerald-500/90 text-white px-4 py-2 rounded-md shadow-lg z-50 backdrop-blur-sm flex items-center animate-slideIn">
                    <Check className="h-5 w-5 mr-2" />
                    <span>Status updated successfully!</span>
                </div>
            )}

            {/* Header with title and navigation */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white/10 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-white/20 shadow-xl">
                    <div className="flex items-center">
                        <div className="p-2 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-lg mr-4 shadow-md hidden sm:block">
                            <Layers className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                                <Layers className="h-6 w-6 mr-2 text-emerald-500 sm:hidden" />
                                Edit Social Status
                                <span className="ml-3 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-semibold rounded-full flex items-center hidden sm:flex">
                                    <Eye className="h-3 w-3 mr-1" /> Update
                                </span>
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-lg">
                                Make changes to your social media content
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/social-status/all"
                            className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back
                        </Link>
                        <button
                            type="button"
                            onClick={() => setShowPreview(!showPreview)}
                            className={`px-4 py-2 ${showPreview ? 'bg-emerald-500 text-white' : 'bg-white/10 backdrop-blur-md text-gray-700 dark:text-gray-300'} rounded-lg border ${showPreview ? 'border-emerald-600' : 'border-white/20'} text-sm font-medium hover:bg-white/20 transition-all duration-300 hidden md:flex lg:hidden items-center`}
                        >
                            <Eye className="h-4 w-4 mr-2" /> {showPreview ? 'Hide Preview' : 'Show Preview'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content - Form and Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column - Form */}
                <div className={`${showPreview ? 'hidden md:block md:col-span-1' : 'md:col-span-2'} lg:col-span-2 space-y-6`}>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg overflow-hidden">
                        {/* Tab navigation for small screens */}
                        <div className="sm:hidden border-b border-white/10">
                            <div className="flex">
                                <button
                                    onClick={() => setActiveSection("main")}
                                    className={`flex-1 py-3 text-center text-sm font-medium ${activeSection === "main" ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-gray-600 dark:text-gray-400'}`}
                                    type="button"
                                >
                                    <FileText className={`h-4 w-4 mx-auto mb-1 ${activeSection === "main" ? 'text-emerald-500' : 'text-gray-400'}`} />
                                    Content
                                </button>
                                {type === 'text' && (
                                    <button
                                        onClick={() => setActiveSection("styling")}
                                        className={`flex-1 py-3 text-center text-sm font-medium ${activeSection === "styling" ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-gray-600 dark:text-gray-400'}`}
                                        type="button"
                                    >
                                        <Palette className={`h-4 w-4 mx-auto mb-1 ${activeSection === "styling" ? 'text-emerald-500' : 'text-gray-400'}`} />
                                        Styling
                                    </button>
                                )}
                                <button
                                    onClick={() => setActiveSection("settings")}
                                    className={`flex-1 py-3 text-center text-sm font-medium ${activeSection === "settings" ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-gray-600 dark:text-gray-400'}`}
                                    type="button"
                                >
                                    <SlidersHorizontal className={`h-4 w-4 mx-auto mb-1 ${activeSection === "settings" ? 'text-emerald-500' : 'text-gray-400'}`} />
                                    Settings
                                </button>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 hidden sm:block">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-emerald-500" />
                                Status Information
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-6">
                                {/* Status Type Display (non-editable) */}
                                <div className={`${activeSection !== "main" && "hidden sm:block"}`}>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                        Status Type
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        <div className={`flex items-center justify-center p-4 rounded-lg border-2 ${type === 'text'
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                            : type === 'image'
                                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                                : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                            }`}>
                                            <div className="flex flex-col items-center">
                                                {type === 'text' ? (
                                                    <FileText className="h-8 w-8 mb-2 text-emerald-500" />
                                                ) : type === 'image' ? (
                                                    <ImageIcon className="h-8 w-8 mb-2 text-emerald-500" />
                                                ) : (
                                                    <Film className="h-8 w-8 mb-2 text-emerald-500" />
                                                )}
                                                <span className="font-medium capitalize">{type} Status</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center ml-3 text-sm text-gray-500 dark:text-gray-400">
                                            <Info className="h-4 w-4 mr-2" />
                                            Status type cannot be changed after creation
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className={`${activeSection !== "main" && "hidden sm:block"}`}>
                                    <div className="flex justify-between items-end mb-1">
                                        <label
                                            htmlFor="content"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            Status Content*
                                        </label>
                                        <div className={`text-xs ${handleCharacterCount()}`}>
                                            {content.length}/150 characters
                                        </div>
                                    </div>
                                    <textarea
                                        id="content"
                                        ref={contentRef}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder={`Enter your ${type} status content or caption...`}
                                        rows={4}
                                        maxLength={150}
                                        className={`w-full px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border ${errors.content
                                            ? "border-red-500"
                                            : "border-white/20"
                                            } focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-gray-700 dark:text-gray-300`}
                                    />
                                    {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
                                </div>

                                {/* Category & Tags */}
                                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${activeSection !== "main" && "hidden sm:grid"}`}>
                                    {/* Category Selection */}
                                    <div>
                                        <label
                                            htmlFor="category"
                                            className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                                        >
                                            Category*
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <select
                                                id="category"
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className={`flex-1 px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border ${errors.category
                                                    ? "border-red-500"
                                                    : "border-white/20"
                                                    } focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-gray-700 dark:text-gray-300`}
                                            >
                                                <option value="">Select a category</option>
                                                {categories.map(cat => (
                                                    <option key={cat._id} value={cat.name}>
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <Link
                                                href="/admin/social-status/categories"
                                                className="px-3 py-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium flex-shrink-0 border border-white/20"
                                            >
                                                Manage
                                            </Link>
                                        </div>
                                        {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                            Tags <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(Optional)</span>
                                        </label>
                                        <div className="flex">
                                            <div className="relative flex-1">
                                                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={tagInput}
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                                                    placeholder="Add a tag and press Enter"
                                                    className="pl-10 pr-4 py-2 w-full bg-white/10 backdrop-blur-md rounded-l-lg border border-white/20 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-gray-700 dark:text-gray-300"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleTagAdd}
                                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-r-lg transition-colors"
                                            >
                                                <Plus className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {tags.map((tag, index) => (
                                                <div
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30"
                                                >
                                                    <span className="text-sm mr-1">#{tag}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleTagRemove(tag)}
                                                        className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-emerald-200 dark:hover:bg-emerald-800"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Text styling options (only for text type) */}
                                {type === 'text' && (
                                    <div className={`${activeSection !== "styling" && activeSection !== "main" && "hidden sm:block"}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-base font-medium text-gray-800 dark:text-white flex items-center">
                                                <Palette className="h-4 w-4 mr-2 text-emerald-500" /> Text Styling Options
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => setIsHelpOpen(!isHelpOpen)}
                                                className="text-xs flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                            >
                                                <HelpCircle className="h-3.5 w-3.5 mr-1" />
                                                {isHelpOpen ? 'Hide' : 'Show'} Design Tips
                                            </button>
                                        </div>

                                        {isHelpOpen && (
                                            <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10 text-xs text-gray-600 dark:text-gray-400">
                                                <p className="mb-2 font-medium text-emerald-600 dark:text-emerald-400">Design Tips:</p>
                                                <ul className="list-disc list-inside space-y-1 ml-1">
                                                    <li>Use contrasting colors for better readability (dark background/light text or vice versa)</li>
                                                    <li>Larger font sizes (24px+) work best for short messages</li>
                                                    <li>Consider using serif fonts (like Georgia) for formal content and sans-serif (like Inter) for modern content</li>
                                                    <li>Keep your text concise - shorter messages have higher engagement</li>
                                                </ul>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                                    Background Color
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowBgPalette(!showBgPalette)}
                                                            style={{ backgroundColor }}
                                                            className="h-10 w-10 rounded-lg border border-white/20 overflow-hidden cursor-pointer flex-shrink-0 shadow-md"
                                                        />

                                                        {showBgPalette && (
                                                            <div className="absolute z-10 mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 grid grid-cols-6 gap-1 w-60">
                                                                {backgroundPalette.map((color, idx) => (
                                                                    <button
                                                                        key={idx}
                                                                        type="button"
                                                                        style={{ backgroundColor: color }}
                                                                        className="h-8 w-8 rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform"
                                                                        onClick={() => {
                                                                            setBackgroundColor(color);
                                                                            setShowBgPalette(false);
                                                                        }}
                                                                    />
                                                                ))}
                                                                <button
                                                                    type="button"
                                                                    className="h-8 w-8 col-span-6 mt-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md border border-gray-200 dark:border-gray-600"
                                                                    onClick={() => setShowBgPalette(false)}
                                                                >
                                                                    Close
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={backgroundColor}
                                                        onChange={(e) => setBackgroundColor(e.target.value)}
                                                        className="flex-1 px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-gray-700 dark:text-gray-300"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                                    Text Color
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowTextPalette(!showTextPalette)}
                                                            style={{ backgroundColor: textColor }}
                                                            className="h-10 w-10 rounded-lg border border-white/20 overflow-hidden cursor-pointer flex-shrink-0 shadow-md"
                                                        />

                                                        {showTextPalette && (
                                                            <div className="absolute z-10 mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 grid grid-cols-6 gap-1 w-60">
                                                                {textPalette.map((color, idx) => (
                                                                    <button
                                                                        key={idx}
                                                                        type="button"
                                                                        style={{ backgroundColor: color }}
                                                                        className="h-8 w-8 rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform"
                                                                        onClick={() => {
                                                                            setTextColor(color);
                                                                            setShowTextPalette(false);
                                                                        }}
                                                                    />
                                                                ))}
                                                                <button
                                                                    type="button"
                                                                    className="h-8 w-8 col-span-6 mt-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md border border-gray-200 dark:border-gray-600"
                                                                    onClick={() => setShowTextPalette(false)}
                                                                >
                                                                    Close
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={textColor}
                                                        onChange={(e) => setTextColor(e.target.value)}
                                                        className="flex-1 px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-gray-700 dark:text-gray-300"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                                    Font Family
                                                </label>
                                                <select
                                                    value={fontFamily}
                                                    onChange={(e) => setFontFamily(e.target.value)}
                                                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-700 dark:text-gray-300"
                                                >
                                                    <option value="Inter">Inter (Modern)</option>
                                                    <option value="Arial">Arial (Clean)</option>
                                                    <option value="Helvetica">Helvetica (Neutral)</option>
                                                    <option value="Georgia">Georgia (Elegant)</option>
                                                    <option value="Times New Roman">Times New Roman (Traditional)</option>
                                                    <option value="Courier New">Courier New (Monospace)</option>
                                                    <option value="Verdana">Verdana (Readable)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                                    Font Size
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="range"
                                                        min="16"
                                                        max="42"
                                                        value={fontSize}
                                                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                                                        className="flex-1 accent-emerald-500"
                                                    />
                                                    <span className="min-w-[50px] text-center text-gray-700 dark:text-gray-300">{fontSize}px</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Media Upload/Display (for image and video types) */}
                                {(type === 'image' || type === 'video') && (
                                    <div className={`${activeSection !== "main" && "hidden sm:block"}`}>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                            {type === 'image' ? 'Status Image' : 'Status Video'}
                                        </label>
                                        <div className="flex items-center justify-center">
                                            <div className="w-full relative">
                                                <div
                                                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center ${errors.mediaFile
                                                        ? "border-red-400 bg-red-50 dark:bg-red-900/10"
                                                        : previewUrl
                                                            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10"
                                                            : "border-white/20 bg-white/5 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:border-emerald-500 dark:hover:bg-emerald-900/10"
                                                        } transition-all duration-200`}
                                                >
                                                    {previewUrl ? (
                                                        <>
                                                            {type === 'image' ? (
                                                                <div className="relative">
                                                                    <Image
                                                                        src={previewUrl}
                                                                        alt="Image preview"
                                                                        width={300}
                                                                        height={300}
                                                                        style={{ maxHeight: "15rem", width: "auto", objectFit: "contain" }}
                                                                        className="mx-auto rounded-lg shadow-lg"
                                                                    />
                                                                    <div className="absolute bottom-2 right-2 flex space-x-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={handleBrowseClick}
                                                                            className="bg-emerald-600/80 dark:bg-emerald-700/80 rounded-full p-1.5 hover:bg-emerald-500/80 transition-colors shadow-md"
                                                                            title="Replace Media"
                                                                        >
                                                                            <Upload className="h-4 w-4 text-white" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="relative">
                                                                    <video
                                                                        src={previewUrl}
                                                                        controls
                                                                        className="max-h-60 rounded-lg shadow-lg"
                                                                    />
                                                                    <div className="absolute bottom-2 right-2 flex space-x-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={handleBrowseClick}
                                                                            className="bg-emerald-600/80 dark:bg-emerald-700/80 rounded-full p-1.5 hover:bg-emerald-500/80 transition-colors shadow-md"
                                                                            title="Replace Media"
                                                                        >
                                                                            <Upload className="h-4 w-4 text-white" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="bg-gradient-to-br from-emerald-400/20 to-blue-400/20 p-4 rounded-full mb-3">
                                                                {type === 'image' ? (
                                                                    <ImageIcon className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
                                                                ) : (
                                                                    <Film className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
                                                                )}
                                                            </div>
                                                            <p className="text-center mb-2 text-gray-700 dark:text-gray-300">
                                                                Drag and drop {type === 'image' ? 'an image' : 'a video'}, or{" "}
                                                                <button
                                                                    type="button"
                                                                    onClick={handleBrowseClick}
                                                                    className="text-emerald-600 dark:text-emerald-400 hover:underline transition-colors font-medium"
                                                                >
                                                                    browse
                                                                </button>
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                                                {type === 'image'
                                                                    ? 'Supports JPEG, PNG, and GIF formats (max 15MB)'
                                                                    : 'Supports MP4, WebM, and OGG formats (max 15MB)'}
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept={type === 'image' ? "image/*" : "video/*"}
                                                    onChange={handleMediaUpload}
                                                    className="hidden"
                                                />
                                                <div
                                                    className="absolute inset-0 pointer-events-none"
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                                            const syntheticEvent = {
                                                                target: { files: e.dataTransfer.files },
                                                            };
                                                            handleMediaUpload(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
                                                        }
                                                    }}
                                                ></div>
                                                {errors.mediaFile && <p className="mt-1 text-sm text-red-500">{errors.mediaFile}</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Advanced Settings */}
                                <div className={`${activeSection !== "settings" && activeSection !== "main" && "hidden sm:block"}`}>
                                    <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/20">
                                        <h3 className="text-base font-medium text-gray-800 dark:text-white mb-3 flex items-center">
                                            <SlidersHorizontal className="h-4 w-4 mr-2 text-emerald-500" />
                                            Status Settings
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium text-gray-700 dark:text-gray-300">Active Status</h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Make this status available for users
                                                    </p>
                                                </div>
                                                <label className="inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={isActive}
                                                        onChange={(e) => setIsActive(e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                                                </label>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                                <div>
                                                    <h4 className="font-medium text-gray-700 dark:text-gray-300">Featured Status</h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Highlight this status at the top of listings
                                                    </p>
                                                </div>
                                                <label className="inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={featured}
                                                        onChange={(e) => setFeatured(e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Error Display */}
                                {errors.submit && (
                                    <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 text-sm text-red-700 dark:text-red-300 flex items-start">
                                        <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                                        <p>{errors.submit}</p>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-4 pt-4 border-t border-white/10">
                                    <Link
                                        href="/admin/social-status/all"
                                        className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-white/20 transition-colors flex items-center"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`px-5 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-md text-sm font-medium shadow-lg flex items-center ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:from-emerald-600 hover:to-green-600 transition-all duration-300'
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Update Status
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                    {/* Status Enhancement Tips */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-emerald-500/20 to-blue-500/20">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                <Sparkles className="h-5 w-5 mr-2 text-emerald-500" />
                                Enhancement Tips
                            </h3>
                        </div>

                        <div className="p-4">
                            {type === 'text' && (
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10 mb-3">
                                    <h4 className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">Text Optimization</h4>
                                    <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-2">
                                        <li className="flex items-start">
                                            <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                                            {content.length < 50 ?
                                                "Great! Your concise text will have higher engagement." :
                                                content.length < 100 ?
                                                    "Good length. Consider testing even shorter variations for higher engagement." :
                                                    "Consider shortening your text - shorter posts (under 50 characters) typically have 66% higher engagement."}
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                                            {backgroundColor.toLowerCase() !== textColor.toLowerCase() ?
                                                "Good contrast between text and background colors." :
                                                "Improve readability by increasing the contrast between text and background colors."}
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                                            {tags.length > 0 ?
                                                `Good use of ${tags.length} tags - this helps with discoverability.` :
                                                "Consider adding 2-5 relevant tags to increase discoverability."}
                                        </li>
                                    </ul>
                                </div>
                            )}

                            {(type === 'image' || type === 'video') && (
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10 mb-3">
                                    <h4 className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">Media Optimization</h4>
                                    <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-2">
                                        <li className="flex items-start">
                                            <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                                            {content.length > 0 ?
                                                "Good! You've added a caption to your media." :
                                                `Add a descriptive caption to your ${type} to provide context.`}
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                                            {type === 'image' ?
                                                "Square images perform best across most platforms." :
                                                "Keep videos under 30 seconds for maximum engagement."}
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                                            {tags.length > 0 ?
                                                `Good use of ${tags.length} tags for discoverability.` :
                                                "Add 2-5 relevant tags to increase discoverability."}
                                        </li>
                                    </ul>
                                </div>
                            )}

                            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                <h4 className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">General Recommendations</h4>
                                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-2">
                                    <li className="flex items-start">
                                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                                        {featured ?
                                            "Status is featured, which will increase visibility." :
                                            usageCount > 20 ?
                                                "Consider featuring this popular status for increased visibility." :
                                                "Set as featured if this is a priority message for users."}
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                                        {category ?
                                            `Properly categorized in "${category}".` :
                                            "Make sure to select an appropriate category."}
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                                        {isActive ?
                                            "Status is active and visible to users." :
                                            "Status is currently inactive. Activate when ready to publish."}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right column - Live Preview */}
                <div className={`${!showPreview && "hidden md:block"} lg:block`}>
                    <div className="lg:sticky lg:top-6 space-y-6">
                        {/* Live Preview Section */}
                        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-emerald-500/20 to-blue-500/20">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                        <Eye className="h-5 w-5 mr-2 text-emerald-500" />
                                        Live Preview
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={cyclePreviewStep}
                                        className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 border border-white/20 hover:bg-white/20 transition-colors flex items-center"
                                    >
                                        <span>{getPreviewStepLabel()}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 flex justify-center">
                                {type === 'text' ? (
                                    <div
                                        className={`rounded-lg overflow-hidden border border-white/10 shadow-lg transition-all duration-300 ${previewStep === 1 ? 'w-full aspect-square' :
                                            previewStep === 2 ? 'w-64 aspect-square' : 'w-80 aspect-auto h-40'
                                            }`}
                                    >
                                        <div
                                            className="w-full h-full flex items-center justify-center p-4"
                                            style={{
                                                backgroundColor,
                                                color: textColor,
                                                fontFamily
                                            }}
                                        >
                                            <p
                                                className="text-center break-words"
                                                style={{ fontSize: `${fontSize}px` }}
                                            >
                                                {content || 'Your text will appear here'}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`rounded-lg overflow-hidden border border-white/10 shadow-lg bg-gray-900 ${previewStep === 1 ? 'w-full aspect-square' :
                                        previewStep === 2 ? 'w-64 aspect-square' : 'w-80 aspect-auto h-40'
                                        }`}>
                                        {previewUrl ? (
                                            type === 'image' ? (
                                                <div className="relative w-full h-full">
                                                    <Image
                                                        src={previewUrl}
                                                        alt="Preview"
                                                        fill
                                                        style={{ objectFit: "cover" }}
                                                        className="rounded-lg"
                                                    />
                                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                                        <p className="text-white text-sm font-medium truncate">{content || "Image caption"}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative w-full h-full">
                                                    <video
                                                        src={previewUrl}
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="bg-black/30 rounded-full p-3">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                                                                <polygon points="5 3 19 12 5 21 5 3" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                                        <p className="text-white text-sm font-medium truncate">{content || "Video caption"}</p>
                                                    </div>
                                                </div>
                                            )
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center">
                                                {type === 'image' ? (
                                                    <ImageIcon className="h-12 w-12 text-gray-500 dark:text-gray-400 mb-2" />
                                                ) : (
                                                    <Film className="h-12 w-12 text-gray-500 dark:text-gray-400 mb-2" />
                                                )}
                                                <p className="text-gray-400 text-sm">Upload {type} to preview</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Status metadata preview */}
                            <div className="px-4 pb-4">
                                <div className="border border-white/10 rounded-lg overflow-hidden bg-white/5">
                                    <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                                        <div className="flex items-center">
                                            {type === 'text' ? (
                                                <FileText className="h-4 w-4 text-emerald-500 mr-1.5" />
                                            ) : type === 'image' ? (
                                                <ImageIcon className="h-4 w-4 text-emerald-500 mr-1.5" />
                                            ) : (
                                                <Film className="h-4 w-4 text-emerald-500 mr-1.5" />
                                            )}
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {type.charAt(0).toUpperCase() + type.slice(1)} Status
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-1.5">
                                            {featured && (
                                                <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs py-0.5 px-2 rounded-full flex items-center">
                                                    <Star className="h-3 w-3 mr-0.5" />
                                                    Featured
                                                </span>
                                            )}
                                            <span className={`${isActive
                                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400"
                                                : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                                                } text-xs py-0.5 px-2 rounded-full flex items-center`}>
                                                {isActive ? <Eye className="h-3 w-3 mr-0.5" /> : <EyeOff className="h-3 w-3 mr-0.5" />}
                                                {isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-3 text-xs space-y-2">
                                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                                            <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                                            {createdAt ? `Created: ${createdAt.toLocaleDateString()}` : 'Last updated: Just now'}
                                        </div>
                                        {category && (
                                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                                                <Layers className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                                                Category: {category}
                                            </div>
                                        )}
                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 pt-1">
                                                {tags.map((tag, idx) => (
                                                    <span key={idx} className="inline-block bg-emerald-100/10 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 rounded-full px-2 py-0.5 text-xs border border-emerald-200/20 dark:border-emerald-800/20">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Statistics Section */}
                        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-emerald-500/20 to-blue-500/20">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                    <BarChart3 className="h-5 w-5 mr-2 text-emerald-500" />
                                    Performance Statistics
                                </h3>
                            </div>

                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center">
                                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-3">
                                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Views</p>
                                            <p className="text-lg font-bold text-gray-800 dark:text-white">{performanceData.views}</p>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center">
                                        <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mr-3">
                                            <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Engagement Rate</p>
                                            <p className="text-lg font-bold text-gray-800 dark:text-white">{performanceData.engagementRate}</p>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center">
                                        <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-3">
                                            <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Usage</p>
                                            <p className="text-lg font-bold text-gray-800 dark:text-white">{usageCount}</p>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center">
                                        <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30 mr-3">
                                            <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Active Days</p>
                                            <p className="text-lg font-bold text-gray-800 dark:text-white">{performanceData.activeDays}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Usage Trend Chart */}
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Weekly Usage Trend</h4>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Last 7 days</span>
                                    </div>

                                    <div className="w-full h-36 bg-white/5 rounded-lg border border-white/10 p-3">
                                        <div className="h-full flex items-end justify-between gap-1">
                                            {performanceData.weeklyData.map((data, idx) => {
                                                const maxCount = Math.max(...performanceData.weeklyData.map(d => d.count), 1);
                                                const height = (data.count / maxCount) * 100;

                                                return (
                                                    <div key={idx} className="flex flex-col items-center flex-1">
                                                        <div
                                                            className="w-full bg-emerald-500/70 hover:bg-emerald-500/90 rounded-t-sm transition-all"
                                                            style={{ height: `${Math.max(5, height)}%` }}
                                                            title={`${data.count} uses on ${data.day}`}
                                                        />
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{data.day}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Status Ranking Info */}
                                {usageCount > 0 && (
                                    <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
                                        <div className="flex items-center">
                                            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30 mr-3">
                                                <Medal className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Status Ranking</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {usageCount > 100 ?
                                                        "Top performing status" :
                                                        usageCount > 50 ?
                                                            "Well-performing status" :
                                                            usageCount > 10 ?
                                                                "Average performing status" :
                                                                "New status - building momentum"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* View User Interface */}
                        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg overflow-hidden">
                            <div className="p-4 text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                    Preview how this status appears to users
                                </p>
                                <Link
                                    href="/social-status"
                                    target="_blank"
                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-blue-600 transition-all duration-200"
                                >
                                    View User Interface <ExternalLink className="h-3.5 w-3.5 ml-2" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Show preview button (mobile only - fixed at bottom) */}
            <div className="fixed bottom-6 inset-x-0 flex justify-center md:hidden">
                <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className={`px-4 py-2 ${showPreview ? 'bg-gray-700 text-white' : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'} rounded-full shadow-lg font-medium text-sm flex items-center space-x-2 border ${showPreview ? 'border-gray-600' : 'border-emerald-600'}`}
                >
                    {showPreview ? (
                        <>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            <span>Back to Form</span>
                        </>
                    ) : (
                        <>
                            <Eye className="h-4 w-4 mr-2" />
                            <span>Preview Status</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}   