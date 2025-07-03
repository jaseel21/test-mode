"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { useStatusStore } from "@/store/statusStore";

// Define form errors interface
interface FormErrors {
    content?: string;
    mediaFile?: string;
    category?: string;
    submit?: string;
}

// Define template interface
interface Template {
    type: "text" | "image" | "video";
    content: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    fontSize: number;
    category: string;
    tags: string[];
}

export default function CreateStatusPage() {
    const router = useRouter();
    const { addStatus, fetchCategories, categories } = useStatusStore();

    // Form state
    const [content, setContent] = useState("");
    const [type, setType] = useState<"text" | "image" | "video">("text");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [backgroundColor, setBackgroundColor] = useState("#111827"); // Dark default
    const [textColor, setTextColor] = useState("#ffffff"); // White default
    const [fontFamily, setFontFamily] = useState("Inter");
    const [fontSize, setFontSize] = useState(24);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [featured, setFeatured] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [scheduleTime, setScheduleTime] = useState<string>("");

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [showPreview, setShowPreview] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showBgPalette, setShowBgPalette] = useState(false);
    const [showTextPalette, setShowTextPalette] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [previewStep, setPreviewStep] = useState(1);
    const [activeSection, setActiveSection] = useState("main"); // main, styling, settings
    const fileInputRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLTextAreaElement>(null);

    // Save notification state
    const [showSaveNotification, setShowSaveNotification] = useState(false);

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

    // Sample templates for inspiration, explicitly typed as Template[]
    const templates: Template[] = [
        {
            type: "text",
            content: "Exciting news! Stay tuned for our big announcement tomorrow.",
            backgroundColor: "#1E3A8A",
            textColor: "#FFFFFF",
            fontFamily: "Inter",
            fontSize: 26,
            category: "Announcements",
            tags: ["news", "announcement", "update"],
        },
        {
            type: "text",
            content: "Flash sale! 50% off all products for the next 24 hours.",
            backgroundColor: "#B91C1C",
            textColor: "#FFFFFF",
            fontFamily: "Arial",
            fontSize: 28,
            category: "Promotions",
            tags: ["sale", "discount", "limited"],
        },
        {
            type: "text",
            content: "Thank you for your continued support! We've reached 10,000 customers.",
            backgroundColor: "#065F46",
            textColor: "#FFFFFF",
            fontFamily: "Georgia",
            fontSize: 24,
            category: "Milestones",
            tags: ["thanks", "milestone", "achievement"],
        },
        {
            type: "text",
            content: "Join us this weekend for our exclusive workshop!",
            backgroundColor: "#7E22CE",
            textColor: "#FFFFFF",
            fontFamily: "Inter",
            fontSize: 28,
            category: "Events",
            tags: ["event", "workshop", "join"],
        },
    ];

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories().finally(() => setIsLoading(false));
    }, [fetchCategories]);

    // Focus on content textarea when changing type
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.focus();
        }
    }, [type]);

    // Auto-hide the save notification after 3 seconds
    useEffect(() => {
        if (showSaveNotification) {
            const timer = setTimeout(() => {
                setShowSaveNotification(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSaveNotification]);

    const handleBrowseClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];

        // Validate file type
        if (
            (type === "image" && !file.type.startsWith("image/")) ||
            (type === "video" && !file.type.startsWith("video/"))
        ) {
            setErrors({
                ...errors,
                mediaFile: `Please upload a valid ${type} file`,
            });
            return;
        }

        // Validate file size (15MB limit)
        if (file.size > 15 * 1024 * 1024) {
            setErrors({
                ...errors,
                mediaFile: `${type} size must be less than 15MB`,
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
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const applyTemplate = (template: Template) => {
        setType(template.type);
        setContent(template.content);
        setBackgroundColor(template.backgroundColor);
        setTextColor(template.textColor);
        setFontFamily(template.fontFamily);
        setFontSize(template.fontSize);
        if (template.category && categories.some((cat) => cat.name === template.category)) {
            setCategory(template.category);
        }
        setTags(template.tags || []);

        // Show success notification
        setShowSaveNotification(true);
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!content.trim()) {
            newErrors.content = "Content is required";
        }

        if (!category) {
            newErrors.category = "Category is required";
        }

        if ((type === "image" || type === "video") && !mediaFile) {
            newErrors.mediaFile = `A ${type} file is required`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setErrors({});

        try {
            const formData = new FormData();
            formData.append("content", content);
            formData.append("type", type);
            formData.append("category", category);
            formData.append("tags", JSON.stringify(tags));

            if (type === "text") {
                formData.append("backgroundColor", backgroundColor);
                formData.append("textColor", textColor);
                formData.append("fontFamily", fontFamily);
                formData.append("fontSize", fontSize.toString());
            }

            if (mediaFile) {
                formData.append("mediaFile", mediaFile);
            }

            formData.append("featured", featured.toString());
            formData.append("isActive", isActive.toString());

            if (scheduleTime) {
                formData.append("isScheduled", "true");
                formData.append("scheduleTime", scheduleTime);
            }

            const response = await fetch("/api/statuses", {
                method: "POST",
                body: formData,
                headers: {
                    "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
                },
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to create status");
            }

            addStatus(data.data);
            router.push("/admin/social-status/all");
        } catch (error) {
            console.error("Error creating status:", error);
            setErrors({
                submit: error instanceof Error ? error.message : "An unknown error occurred",
            });
            window.scrollTo(0, 0);
        } finally {
            setIsSubmitting(false);
        }
    };

    const cyclePreviewStep = () => {
        setPreviewStep((prev) => (prev % 3) + 1);
    };

    const getPreviewStepLabel = () => {
        switch (previewStep) {
            case 1:
                return "Desktop View";
            case 2:
                return "Mobile View";
            case 3:
                return "Feed Preview";
            default:
                return "Preview";
        }
    };

    const handleCharacterCount = () => {
        const count = content.length;
        if (count < 80) return "text-emerald-500";
        if (count < 120) return "text-amber-500";
        return "text-red-500";
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center flex flex-col items-center">
                    <div className="relative w-16 h-16">
                        <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                        <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-emerald-500 animate-spin"></div>
                    </div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300 animate-pulse">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6 max-w-7xl mx-auto">
            {/* Save notification */}
            {showSaveNotification && (
                <div className="fixed top-4 right-4 bg-emerald-500/90 text-white px-4 py-2 rounded-md shadow-lg z-50 backdrop-blur-sm flex items-center animate-slideIn">
                    <Check className="h-5 w-5 mr-2" />
                    <span>Template applied successfully!</span>
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
                                Create New Social Status
                                <span className="ml-3 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-xs font-semibold rounded-full flex items-center hidden sm:flex">
                                    <Sparkles className="h-3 w-3 mr-1" /> New
                                </span>
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-lg">
                                Create engaging social media content to share with your audience
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
                            className={`px-4 py-2 ${
                                showPreview ? "bg-emerald-500 text-white" : "bg-white/10 backdrop-blur-md text-gray-700 dark:text-gray-300"
                            } rounded-lg border ${showPreview ? "border-emerald-600" : "border-white/20"} text-sm font-medium hover:bg-white/20 transition-all duration-300 hidden md:flex lg:hidden items-center`}
                        >
                            <Eye className="h-4 w-4 mr-2" /> {showPreview ? "Hide Preview" : "Show Preview"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content - Form and Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column - Form */}
                <div className={`${showPreview ? "hidden md:block md:col-span-1" : "md:col-span-2"} lg:col-span-2 space-y-6`}>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg overflow-hidden">
                        {/* Tab navigation for small screens */}
                        <div className="sm:hidden border-b border-white/10">
                            <div className="flex">
                                <button
                                    onClick={() => setActiveSection("main")}
                                    className={`flex-1 py-3 text-center text-sm font-medium ${
                                        activeSection === "main" ? "text-emerald-500 border-b-2 border-emerald-500" : "text-gray-600 dark:text-gray-400"
                                    }`}
                                >
                                    <FileText className={`h-4 w-4 mx-auto mb-1 ${activeSection === "main" ? "text-emerald-500" : "text-gray-400"}`} />
                                    Content
                                </button>
                                <button
                                    onClick={() => setActiveSection("styling")}
                                    className={`flex-1 py-3 text-center text-sm font-medium ${
                                        activeSection === "styling" ? "text-emerald-500 border-b-2 border-emerald-500" : "text-gray-600 dark:text-gray-400"
                                    }`}
                                >
                                    <Palette className={`h-4 w-4 mx-auto mb-1 ${activeSection === "styling" ? "text-emerald-500" : "text-gray-400"}`} />
                                    Styling
                                </button>
                                <button
                                    onClick={() => setActiveSection("settings")}
                                    className={`flex-1 py-3 text-center text-sm font-medium ${
                                        activeSection === "settings" ? "text-emerald-500 border-b-2 border-emerald-500" : "text-gray-600 dark:text-gray-400"
                                    }`}
                                >
                                    <SlidersHorizontal className={`h-4 w-4 mx-auto mb-1 ${activeSection === "settings" ? "text-emerald-500" : "text-gray-400"}`} />
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
                                {/* Status Type Selection - Always visible */}
                                <div className={`${activeSection !== "main" && "hidden sm:block"}`}>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Status Type*</label>
                                    <div className="flex flex-wrap gap-3">
                                        <label
                                            className={`flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                type === "text"
                                                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700"
                                            }`}
                                        >
                                            <input type="radio" name="type" value="text" checked={type === "text"} onChange={() => setType("text")} className="sr-only" />
                                            <div className="flex flex-col items-center">
                                                <FileText className={`h-8 w-8 mb-2 ${type === "text" ? "text-emerald-500" : "text-gray-400"}`} />
                                                <span className="font-medium">Text Status</span>
                                            </div>
                                        </label>

                                        <label
                                            className={`flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                type === "image"
                                                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700"
                                            }`}
                                        >
                                            <input type="radio" name="type" value="image" checked={type === "image"} onChange={() => setType("image")} className="sr-only" />
                                            <div className="flex flex-col items-center">
                                                <ImageIcon className={`h-8 w-8 mb-2 ${type === "image" ? "text-emerald-500" : "text-gray-400"}`} />
                                                <span className="font-medium">Image Status</span>
                                            </div>
                                        </label>

                                        <label
                                            className={`flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                type === "video"
                                                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700"
                                            }`}
                                        >
                                            <input type="radio" name="type" value="video" checked={type === "video"} onChange={() => setType("video")} className="sr-only" />
                                            <div className="flex flex-col items-center">
                                                <Film className={`h-8 w-8 mb-2 ${type === "video" ? "text-emerald-500" : "text-gray-400"}`} />
                                                <span className="font-medium">Video Status</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Content Section - Main tab content */}
                                <div className={`${activeSection !== "main" && "hidden sm:block"}`}>
                                    <div className="flex justify-between items-end mb-1">
                                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Status Content*
                                        </label>
                                        <div className={`text-xs ${handleCharacterCount()}`}>{content.length}/150 characters</div>
                                    </div>
                                    <textarea
                                        id="content"
                                        ref={contentRef}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder={`Enter your ${type} status content or caption...`}
                                        rows={4}
                                        maxLength={150}
                                        className={`w-full px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border ${
                                            errors.content ? "border-red-500" : "border-white/20"
                                        } focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-gray-700 dark:text-gray-300`}
                                    />
                                    {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {type === "text"
                                            ? "Write a clear, concise message for better engagement."
                                            : type === "image"
                                            ? "Add a compelling caption to your image."
                                            : "Write a descriptive caption for your video."}
                                    </p>
                                </div>

                                {/* Category & Tags - Main tab content */}
                                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${activeSection !== "main" && "hidden sm:grid"}`}>
                                    {/* Category Selection */}
                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                            Category*
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <select
                                                id="category"
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className={`flex-1 px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border ${
                                                    errors.category ? "border-red-500" : "border-white/20"
                                                } focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-gray-700 dark:text-gray-300`}
                                            >
                                                <option value="">Select a category</option>
                                                {categories.map((cat) => (
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
                                                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleTagAdd())}
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

                                {/* Media Upload - Main tab content for image/video */}
                                {(type === "image" || type === "video") && (
                                    <div className={`${activeSection !== "main" && "hidden sm:block"}`}>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                            {type === "image" ? "Upload Image*" : "Upload Video*"}
                                        </label>
                                        <div className="flex items-center justify-center">
                                            <div className="w-full relative">
                                                <div
                                                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center ${
                                                        errors.mediaFile
                                                            ? "border-red-400 bg-red-50 dark:bg-red-900/10"
                                                            : previewUrl
                                                            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10"
                                                            : "border-white/20 bg-white/5 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:border-emerald-500 dark:hover:bg-emerald-900/10"
                                                    } transition-all duration-200`}
                                                >
                                                    {previewUrl ? (
                                                        <>
                                                            {type === "image" ? (
                                                                <div className="relative">
                                                                    <NextImage
                                                                        src={previewUrl}
                                                                        alt="Image preview"
                                                                        width={0}
                                                                        height={0}
                                                                        sizes="100vw"
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
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setPreviewUrl(null);
                                                                                setMediaFile(null);
                                                                                if (fileInputRef.current) {
                                                                                    fileInputRef.current.value = "";
                                                                                }
                                                                            }}
                                                                            className="bg-gray-700/80 dark:bg-gray-800/80 rounded-full p-1.5 hover:bg-red-500/80 transition-colors shadow-md"
                                                                            title="Remove Media"
                                                                        >
                                                                            <X className="h-4 w-4 text-white" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="relative">
                                                                    <video src={previewUrl} controls className="max-h-60 rounded-lg shadow-lg" />
                                                                    <div className="absolute bottom-2 right-2 flex space-x-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={handleBrowseClick}
                                                                            className="bg-emerald-600/80 dark:bg-emerald-700/80 rounded-full p-1.5 hover:bg-emerald-500/80 transition-colors shadow-md"
                                                                            title="Replace Media"
                                                                        >
                                                                            <Upload className="h-4 w-4 text-white" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setPreviewUrl(null);
                                                                                setMediaFile(null);
                                                                                if (fileInputRef.current) {
                                                                                    fileInputRef.current.value = "";
                                                                                }
                                                                            }}
                                                                            className="bg-gray-700/80 dark:bg-gray-800/80 rounded-full p-1.5 hover:bg-red-500/80 transition-colors shadow-md"
                                                                            title="Remove Media"
                                                                        >
                                                                            <X className="h-4 w-4 text-white" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="bg-gradient-to-br from-emerald-400/20 to-blue-400/20 p-4 rounded-full mb-3">
                                                                {type === "image" ? (
                                                                    <ImageIcon className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
                                                                ) : (
                                                                    <Film className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
                                                                )}
                                                            </div>
                                                            <p className="text-center mb-2 text-gray-700 dark:text-gray-300">
                                                                Drag and drop {type === "image" ? "an image" : "a video"}, or{" "}
                                                                <button
                                                                    type="button"
                                                                    onClick={handleBrowseClick}
                                                                    className="text-emerald-600 dark:text-emerald-400 hover:underline transition-colors font-medium"
                                                                >
                                                                    browse
                                                                </button>
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                                                {type === "image"
                                                                    ? "Supports JPEG, PNG, and GIF formats (max 15MB)"
                                                                    : "Supports MP4, WebM, and OGG formats (max 15MB)"}
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept={type === "image" ? "image/*" : "video/*"}
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

                                {/* Text styling options - Styling tab content */}
                                {type === "text" && (
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
                                                {isHelpOpen ? "Hide" : "Show"} Design Tips
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
                                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Background Color</label>
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
                                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Text Color</label>
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
                                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Font Family</label>
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
                                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Font Size</label>
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

                                {/* Advanced Settings - Settings tab content */}
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
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Make this status available for users</p>
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
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Highlight this status at the top of listings</p>
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

                                            <div className="pt-3 border-t border-white/10">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Schedule Date & Time</label>
                                                        <div className="relative">
                                                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                            <input
                                                                type="datetime-local"
                                                                value={scheduleTime}
                                                                onChange={(e) => setScheduleTime(e.target.value)}
                                                                className="pl-10 pr-4 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-700 dark:text-gray-300"
                                                            />
                                                        </div>
                                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Status will automatically activate at this time</p>
                                                    </div>
                                                    <div className="flex items-end pl-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const tomorrow = new Date();
                                                                tomorrow.setDate(tomorrow.getDate() + 1);
                                                                tomorrow.setHours(9, 0, 0, 0);
                                                                setScheduleTime(tomorrow.toISOString().slice(0, 16));
                                                            }}
                                                            className="px-3 py-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium border border-white/20 mr-2"
                                                        >
                                                            9AM Tomorrow
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const nextWeek = new Date();
                                                                nextWeek.setDate(nextWeek.getDate() + 7);
                                                                nextWeek.setHours(9, 0, 0, 0);
                                                                setScheduleTime(nextWeek.toISOString().slice(0, 16));
                                                            }}
                                                            className="px-3 py-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium border border-white/20"
                                                        >
                                                            Next Week
                                                        </button>
                                                    </div>
                                                </div>
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
                                        className={`px-5 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-md text-sm font-medium shadow-lg flex items-center ${
                                            isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:from-emerald-600 hover:to-green-600 transition-all duration-300"
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Create Status
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
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
                                {type === "text" ? (
                                    <div
                                        className={`rounded-lg overflow-hidden border border-white/10 shadow-lg transition-all duration-300 ${
                                            previewStep === 1 ? "w-full aspect-square" : previewStep === 2 ? "w-64 aspect-square" : "w-80 aspect-auto h-40"
                                        }`}
                                    >
                                        <div
                                            className="w-full h-full flex items-center justify-center p-4"
                                            style={{
                                                backgroundColor,
                                                color: textColor,
                                                fontFamily,
                                            }}
                                        >
                                            <p className="text-center break-words" style={{ fontSize: `${fontSize}px` }}>
                                                {content || "Your text will appear here"}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className={`rounded-lg overflow-hidden border border-white/10 shadow-lg bg-gray-900 ${
                                            previewStep === 1 ? "w-full aspect-square" : previewStep === 2 ? "w-64 aspect-square" : "w-80 aspect-auto h-40"
                                        }`}
                                    >
                                        {previewUrl ? (
                                            type === "image" ? (
                                                <div className="relative w-full h-full">
                                                    <NextImage
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
                                                    <video src={previewUrl} className="w-full h-full object-cover rounded-lg" />
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
                                                {type === "image" ? (
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
                                            {type === "text" ? (
                                                <FileText className="h-4 w-4 text-emerald-500 mr-1.5" />
                                            ) : type === "image" ? (
                                                <ImageIcon className="h-4 w-4 text-emerald-500 mr-1.5" />
                                            ) : (
                                                <Film className="h-4 w-4 text-emerald-500 mr-1.5" />
                                            )}
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{type.charAt(0).toUpperCase() + type.slice(1)} Status</span>
                                        </div>
                                        <div className="flex items-center space-x-1.5">
                                            {featured && (
                                                <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs py-0.5 px-2 rounded-full flex items-center">
                                                    <Star className="h-3 w-3 mr-0.5" />
                                                    Featured
                                                </span>
                                            )}
                                            <span
                                                className={`${
                                                    isActive
                                                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400"
                                                        : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                                                } text-xs py-0.5 px-2 rounded-full flex items-center`}
                                            >
                                                {isActive ? <Eye className="h-3 w-3 mr-0.5" /> : <EyeOff className="h-3 w-3 mr-0.5" />}
                                                {isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-3 text-xs space-y-2">
                                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                                            <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                                            Posted {scheduleTime ? new Date(scheduleTime).toLocaleString() : "now"}
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
                                                    <span
                                                        key={idx}
                                                        className="inline-block bg-emerald-100/10 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 rounded-full px-2 py-0.5 text-xs border border-emerald-200/20 dark:border-emerald-800/20"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Templates Section */}
                        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-emerald-500/20 to-blue-500/20">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                    <Sparkles className="h-5 w-5 mr-2 text-emerald-500" />
                                    Templates & Inspiration
                                </h3>
                            </div>

                            <div className="p-4 space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Click a template to quickly start with a professional design</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {templates.map((template, idx) => (
                                        <div
                                            key={idx}
                                            className="border border-white/10 rounded-lg overflow-hidden hover:border-emerald-400 transition-all duration-200 cursor-pointer group"
                                            onClick={() => applyTemplate(template)}
                                        >
                                            <div
                                                className="aspect-[4/1] flex items-center justify-center p-3 group-hover:brightness-110 transition-all"
                                                style={{
                                                    backgroundColor: template.backgroundColor,
                                                    color: template.textColor,
                                                    fontFamily: template.fontFamily,
                                                }}
                                            >
                                                <p style={{ fontSize: `${template.fontSize / 1.5}px` }} className="text-center">
                                                    {template.content}
                                                </p>
                                            </div>
                                            <div className="p-2 bg-white/5 border-t border-white/10 flex justify-between items-center">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{template.category}</span>
                                                <button
                                                    type="button"
                                                    className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-full text-xs font-medium hover:bg-emerald-200 dark:hover:bg-emerald-800/40 transition-colors flex items-center"
                                                >
                                                    <Zap className="h-3 w-3 mr-1" /> Apply
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tips Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-emerald-500/20 to-blue-500/20">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <Info className="h-5 w-5 mr-2 text-emerald-500" />
                        Tips for Great Social Statuses
                    </h3>
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 hover:bg-white/10">
                            <h4 className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2 flex items-center">
                                <FileText className="h-4 w-4 mr-1.5" />
                                Text Statuses
                            </h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Keep text statuses concise and impactful. Use contrasting colors for better readability and aim for 5-15 words for maximum engagement.
                            </p>
                        </div>

                        <div className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 hover:bg-white/10">
                            <h4 className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2 flex items-center">
                                <ImageIcon className="h-4 w-4 mr-1.5" />
                                Image Statuses
                            </h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Use high-quality images with good resolution. Square format (1:1) performs best on most platforms. Avoid cluttered backgrounds for better visual impact.
                            </p>
                        </div>

                        <div className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 hover:bg-white/10">
                            <h4 className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2 flex items-center">
                                <Film className="h-4 w-4 mr-1.5" />
                                Video Statuses
                            </h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Keep videos short (under 30 seconds) for higher engagement. Include captions since many viewers watch without sound. Start with an attention-grabbing first frame.
                            </p>
                        </div>

                        <div className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 hover:bg-white/10">
                            <h4 className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2 flex items-center">
                                <Users className="h-4 w-4 mr-1.5" />
                                User Engagement
                            </h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Include a call to action when appropriate. Use relevant hashtags (2-5 is optimal) to increase discovery. Schedule posts during peak activity times for your audience.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Show preview button (mobile only - fixed at bottom) */}
            <div className="fixed bottom-6 inset-x-0 flex justify-center md:hidden">
                <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className={`px-4 py-2 ${
                        showPreview ? "bg-gray-700 text-white" : "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                    } rounded-full shadow-lg font-medium text-sm flex items-center space-x-2 border ${showPreview ? "border-gray-600" : "border-emerald-600"}`}
                >
                    {showPreview ? (
                        <>
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Form</span>
                        </>
                    ) : (
                        <>
                            <Eye className="h-4 w-4" />
                            <span>Preview Status</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}