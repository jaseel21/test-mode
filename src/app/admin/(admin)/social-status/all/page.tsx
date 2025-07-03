"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowLeft,
    Edit,
    Trash2,
    Search,
    Plus,
    RefreshCw,
    AlertCircle,
    Users,
    TrendingUp,
    Eye,
    EyeOff,
    Star,
    FileText,
    Image as ImageIcon,
    Film,
    Filter,
    X,
    SlidersHorizontal,
    CheckCircle2,
    CalendarDays,
    Clock,
    Folder,
    Layers
} from "lucide-react";
import { useStatusStore } from "@/store/statusStore";
import VideoPlayerModal from "./VideoPlayerModal";
import VideoStatusCard from "./VideoStatusCard";
// import VideoThumbnail from "./VideoThumbnail";

// Define Status interface if not already defined in types
interface Status {
    _id: string;
    content: string;
    type: 'text' | 'image' | 'video';
    mediaUrl?: string;
    isActive: boolean;
    featured: boolean;
    category: string;
    createdAt?: string;
    usageCount?: number;
    tags?: string[];
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    fontSize?: number;
    duration?: string;
}

export default function AllStatusesPage() {
    const {
        statuses,
        fetchStatuses,
        toggleStatusActive,
        toggleStatusFeatured,
        isLoading,
        error
    } = useStatusStore();

    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filter, setFilter] = useState<"all" | "active" | "inactive" | "featured">("all");
    const [typeFilter, setTypeFilter] = useState<"all" | "text" | "image" | "video">("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("");
    const [categories, setCategories] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular" | "alphabetical">("newest");
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false);
    const [currentVideo, setCurrentVideo] = useState<{ url: string; title: string }>({ url: "", title: "" });

    useEffect(() => {
        fetchStatuses(filter === "active")
            .then(() => setLastRefreshed(new Date()))
            .catch((err) => console.error('Failed to fetch statuses:', err));
    }, [filter, fetchStatuses]);

    useEffect(() => {
        if (statuses.length > 0) {
            const uniqueCategories = Array.from(new Set(statuses.map(status => status.category)));
            setCategories(uniqueCategories);
        }
    }, [statuses]);

    // Add video duration extraction
    useEffect(() => {
        const extractDurations = async () => {
            // This function would extract durations from videos
            // For demo purposes, we're not actually implementing it fully
            // In a real app, you would update the statuses with duration info
            console.log("Would extract video durations here");
        };
        
        if (statuses.length > 0) {
            extractDurations();
        }
    }, [statuses]);

    const filteredStatuses = statuses.filter((status: Status) => {
        const matchesSearch = status.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "all" || status.type === typeFilter;
        const matchesCategory = !categoryFilter || status.category === categoryFilter;
        const matchesFilter =
            filter === "all" ||
            (filter === "active" && status.isActive) ||
            (filter === "inactive" && !status.isActive) ||
            (filter === "featured" && status.featured);

        return matchesSearch && matchesType && matchesCategory && matchesFilter;
    });

    const sortedStatuses = [...filteredStatuses].sort((a: Status, b: Status) => {
        switch (sortBy) {
            case "newest":
                return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
            case "oldest":
                return new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime();
            case "popular":
                return (b.usageCount || 0) - (a.usageCount || 0);
            case "alphabetical":
                return a.content.localeCompare(b.content);
            default:
                return 0;
        }
    });

    const handleToggleActive = async (status: Status) => {
        try {
            await toggleStatusActive(status._id, !status.isActive);
        } catch (err) {
            console.error('Failed to toggle status active state', err);
        }
    };

    const handleToggleFeatured = async (status: Status) => {
        try {
            await toggleStatusFeatured(status._id, !status.featured);
        } catch (err) {
            console.error('Failed to toggle status featured state', err);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await fetchStatuses(filter === "active");
            setLastRefreshed(new Date());
        } catch (err) {
            console.error('Failed to refresh statuses', err);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleVideoClick = (status: Status) => {
        if (status.type === 'video' && status.mediaUrl) {
            setCurrentVideo({
                url: status.mediaUrl,
                title: status.content
            });
            setVideoModalOpen(true);
        }
    };

    const getStatusTypeIcon = (type: Status['type']) => {
        switch (type) {
            case 'text':
                return <FileText className="h-4 w-4 text-blue-500" />;
            case 'image':
                return <ImageIcon className="h-4 w-4 text-green-500" />;
            case 'video':
                return <Film className="h-4 w-4 text-purple-500" />;
            default:
                return <FileText className="h-4 w-4 text-gray-500" />;
        }
    };

    const toggleStatusSelection = (statusId: string) => {
        setSelectedStatuses(prev =>
            prev.includes(statusId)
                ? prev.filter(id => id !== statusId)
                : [...prev, statusId]
        );
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFilter("all");
        setTypeFilter("all");
        setCategoryFilter("");
    };

    const handleEdit = (statusId: string) => {
        window.location.href = `/admin/social-status/edit?id=${statusId}`;
    };

    const handleDelete = (statusId: string) => {
        window.location.href = `/admin/social-status/delete?id=${statusId}`;
    };

    // Add CSS animation class
    useEffect(() => {
        // Add fadeIn animation to CSS if it doesn't exist
        if (!document.getElementById('custom-animations')) {
            const style = document.createElement('style');
            style.id = 'custom-animations';
            style.innerHTML = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-in-out;
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    return (
        <div className="p-4 md:p-6 space-y-6">
            <VideoPlayerModal 
                isOpen={videoModalOpen}
                onClose={() => setVideoModalOpen(false)}
                videoUrl={currentVideo.url}
                videoTitle={currentVideo.title}
            />

            {/* Header Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 px-6 py-5 border-b border-white/10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                                <Layers className="h-6 w-6 mr-2 text-emerald-500" />
                                All Social Statuses
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 md:ml-8">
                                Manage and preview all available social statuses
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href="/admin/social-status"
                                className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" /> Dashboard
                            </Link>

                            <Link
                                href="/admin/social-status/create"
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center shadow-lg"
                            >
                                <Plus className="h-4 w-4 mr-2" /> Create Status
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Status Summary */}
                <div className="px-6 py-4 border-b border-white/10">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex gap-6">
                            <div className="flex items-center">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-3">
                                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Statuses</p>
                                    <p className="text-lg font-bold text-gray-800 dark:text-white">{statuses.length}</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 mr-3">
                                    <Eye className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                                    <p className="text-lg font-bold text-gray-800 dark:text-white">
                                        {statuses.filter((s: Status) => s.isActive).length}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 mr-3">
                                    <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Featured</p>
                                    <p className="text-lg font-bold text-gray-800 dark:text-white">
                                        {statuses.filter((s: Status) => s.featured).length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            Last updated: {lastRefreshed.toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg overflow-hidden">
                <div className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search statuses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                            />
                        </div>

                        <div className="flex sm:flex-shrink-0 gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center whitespace-nowrap"
                            >
                                <Filter className="h-4 w-4 mr-2" /> {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </button>

                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center whitespace-nowrap disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
                            </button>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                className="px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="popular">Most Used</option>
                                <option value="alphabetical">Alphabetical</option>
                            </select>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10 animate-fadeIn">
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                        <SlidersHorizontal className="h-4 w-4 mr-1.5" /> Status
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setFilter("all")}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === "all"
                                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30"
                                                    : "bg-white/10 text-gray-600 dark:text-gray-400 border border-white/10"
                                                }`}
                                        >
                                            All
                                        </button>
                                        <button
                                            onClick={() => setFilter("active")}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === "active"
                                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30"
                                                    : "bg-white/10 text-gray-600 dark:text-gray-400 border border-white/10"
                                                }`}
                                        >
                                            <Eye className="inline-block h-3 w-3 mr-1" /> Active
                                        </button>
                                        <button
                                            onClick={() => setFilter("featured")}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === "featured"
                                                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30"
                                                    : "bg-white/10 text-gray-600 dark:text-gray-400 border border-white/10"
                                                }`}
                                        >
                                            <Star className="inline-block h-3 w-3 mr-1" /> Featured
                                        </button>
                                        <button
                                            onClick={() => setFilter("inactive")}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === "inactive"
                                                    ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
                                                    : "bg-white/10 text-gray-600 dark:text-gray-400 border border-white/10"
                                                }`}
                                        >
                                            <EyeOff className="inline-block h-3 w-3 mr-1" /> Inactive
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                        <FileText className="h-4 w-4 mr-1.5" /> Type
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setTypeFilter("all")}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${typeFilter === "all"
                                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30"
                                                    : "bg-white/10 text-gray-600 dark:text-gray-400 border border-white/10"
                                                }`}
                                        >
                                            All Types
                                        </button>
                                        <button
                                            onClick={() => setTypeFilter("text")}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${typeFilter === "text"
                                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30"
                                                    : "bg-white/10 text-gray-600 dark:text-gray-400 border border-white/10"
                                                }`}
                                        >
                                            <FileText className="inline-block h-3 w-3 mr-1" /> Text
                                        </button>
                                        <button
                                            onClick={() => setTypeFilter("image")}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${typeFilter === "image"
                                                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800/30"
                                                    : "bg-white/10 text-gray-600 dark:text-gray-400 border border-white/10"
                                                }`}
                                        >
                                            <ImageIcon className="inline-block h-3 w-3 mr-1" /> Image
                                        </button>
                                        <button
                                            onClick={() => setTypeFilter("video")}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${typeFilter === "video"
                                                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 border border-purple-200 dark:border-purple-800/30"
                                                    : "bg-white/10 text-gray-600 dark:text-gray-400 border border-white/10"
                                                }`}
                                        >
                                            <Film className="inline-block h-3 w-3 mr-1" /> Video
                                        </button>
                                    </div>
                                </div>

                                {categories.length > 0 && (
                                    <div>
                                        <label
                                            htmlFor="categorySelect"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                                        >
                                            <Folder className="h-4 w-4 mr-1.5" /> Category
                                        </label>
                                        <select
                                            id="categorySelect"
                                            value={categoryFilter}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                            className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[180px]"
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map((category) => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="ml-auto self-end">
                                    <button
                                        onClick={clearFilters}
                                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center"
                                    >
                                        <X className="h-3.5 w-3.5 mr-1.5" /> Clear Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center py-12">
                    <div className="flex flex-col items-center">
                        <div className="relative w-12 h-12">
                            <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                            <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-emerald-500 animate-spin"></div>
                        </div>
                        <p className="mt-4 text-gray-500 dark:text-gray-400">Loading statuses...</p>
                    </div>
                </div>
            )}

            {!isLoading && error && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-red-300 dark:border-red-900/50 shadow-lg p-6 text-center max-w-lg mx-auto">
                    <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Error Loading Statuses</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center mx-auto"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" /> Try Again
                    </button>
                </div>
            )}

            {!isLoading && !error && filteredStatuses.length === 0 && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-8 text-center max-w-lg mx-auto">
                    <div className="bg-white/5 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                        {(searchTerm || filter !== "all" || typeFilter !== "all" || categoryFilter)
                            ? "No matching statuses found"
                            : "No statuses available"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                        {(searchTerm || filter !== "all" || typeFilter !== "all" || categoryFilter)
                            ? "No statuses match your current filters. Try adjusting your search criteria or create a new status."
                            : "You haven't created any statuses yet. Get started by creating your first social status."}
                    </p>
                    {(searchTerm || filter !== "all" || typeFilter !== "all" || categoryFilter) ? (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 flex items-center shadow-lg mx-auto w-fit"
                        >
                            <X className="h-4 w-4 mr-2" /> Clear Filters
                        </button>
                    ) : (
                        <Link
                            href="/admin/social-status/create"
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center shadow-lg mx-auto w-fit"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Create New Status
                        </Link>
                    )}
                </div>
            )}

            {selectedStatuses.length > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 z-10 flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {selectedStatuses.length} {selectedStatuses.length === 1 ? 'status' : 'statuses'} selected
                    </span>

                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                selectedStatuses.forEach(id => {
                                    const status = statuses.find((s: Status) => s._id === id);
                                    if (status && !status.isActive) {
                                        toggleStatusActive(id, true);
                                    }
                                });
                                setSelectedStatuses([]);
                            }}
                            className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-lg text-sm flex items-center hover:bg-emerald-200 dark:hover:bg-emerald-800/40"
                        >
                            <Eye className="h-3.5 w-3.5 mr-1.5" /> Activate All
                        </button>

                        <button
                            onClick={() => {
                                selectedStatuses.forEach(id => {
                                    const status = statuses.find((s: Status) => s._id === id);
                                    if (status && status.isActive) {
                                        toggleStatusActive(id, false);
                                    }
                                });
                                setSelectedStatuses([]);
                            }}
                            className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg text-sm flex items-center hover:bg-red-200 dark:hover:bg-red-800/40"
                        >
                            <EyeOff className="h-3.5 w-3.5 mr-1.5" /> Deactivate All
                        </button>

                        <button
                            onClick={() => setSelectedStatuses([])}
                            className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {!isLoading && !error && sortedStatuses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedStatuses.map((status: Status) => (
                        status.type === 'video' ? (
                            <VideoStatusCard 
                                key={status._id}
                                status={status}
                                onPlay={handleVideoClick}
                                isSelected={selectedStatuses.includes(status._id)}
                                onSelect={toggleStatusSelection}
                                onToggleActive={handleToggleActive}
                                onToggleFeatured={handleToggleFeatured}
                                onEdit={() => handleEdit(status._id)}
                                onDelete={() => handleDelete(status._id)}
                            />
                        ) : (
                            <div
                                key={status._id}
                                className={`bg-white/10 backdrop-blur-md rounded-xl border ${status.isActive
                                        ? status.featured
                                            ? "border-amber-300/30 dark:border-amber-700/30"
                                            : "border-white/20"
                                        : "border-red-300/30 dark:border-red-900/30"
                                } shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${selectedStatuses.includes(status._id) ? "ring-2 ring-blue-500" : ""
                                }`}
                            >
                                <div className="flex justify-between items-center px-4 py-2 border-b border-white/10 bg-white/5">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedStatuses.includes(status._id)}
                                            onChange={() => toggleStatusSelection(status._id)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                        />
                                        <div className="flex items-center">
                                            {getStatusTypeIcon(status.type)}
                                            <span className="ml-1.5 text-xs font-medium capitalize text-gray-700 dark:text-gray-300">
                                                {status.type} Status
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex space-x-1">
                                        <div
                                            className={`${status.isActive
                                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400"
                                                    : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                                                } text-xs py-0.5 px-2 rounded-full flex items-center`}
                                        >
                                            {status.isActive ? <Eye className="h-3 w-3 mr-0.5" /> : <EyeOff className="h-3 w-3 mr-0.5" />}
                                            {status.isActive ? 'Active' : 'Inactive'}
                                        </div>

                                        {status.featured && (
                                            <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs py-0.5 px-2 rounded-full flex items-center ml-1">
                                                <Star className="h-3 w-3 mr-0.5" />
                                                Featured
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {status.type === 'text' ? (
                                    <div
                                        className="aspect-square relative overflow-hidden flex items-center justify-center p-6"
                                        style={{
                                            backgroundColor: status.backgroundColor || '#111827',
                                            color: status.textColor || '#ffffff',
                                            fontFamily: status.fontFamily || 'Inter'
                                        }}
                                    >
                                        <p
                                            className="text-center"
                                            style={{
                                                fontSize: `${status.fontSize || 24}px`,
                                                lineHeight: 1.3
                                            }}
                                        >
                                            {status.content}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="aspect-square relative bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                        {status.mediaUrl ? (
                                            <Image
                                                src={status.mediaUrl}
                                                alt={status.content}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                style={{ objectFit: "cover" }}
                                                priority={false}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <ImageIcon className="h-12 w-12" />
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="p-4 bg-white/5">
                                    <h3 className="text-base font-medium text-gray-800 dark:text-white mb-2 line-clamp-2">
                                        {status.content}
                                    </h3>

                                    <div className="space-y-3 text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-wrap gap-2">
                                            <div className="bg-white/10 rounded-md px-2 py-1 flex items-center">
                                                <Folder className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />
                                                <span className="text-gray-700 dark:text-gray-300">{status.category}</span>
                                            </div>

                                            {status.createdAt && (
                                                <div className="bg-white/10 rounded-md px-2 py-1 flex items-center">
                                                    <CalendarDays className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />
                                                    <span className="text-gray-700 dark:text-gray-300">
                                                        {new Date(status.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {status.tags && status.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {status.tags.map((tag, idx) => (
                                                    <span key={idx} className="inline-block bg-blue-100/10 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 rounded-full px-2 py-0.5 text-xs border border-blue-200/20 dark:border-blue-800/20">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                            <div className={`flex items-center px-2 py-1 rounded ${(status.usageCount || 0) > 0
                                                    ? "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                                }`}>
                                                <Users className="h-3 w-3 mr-1" />
                                                <span className="font-medium">{status.usageCount || 0}</span>
                                                <span className="ml-1 text-xs opacity-80">uses</span>
                                            </div>

                                            {(status.usageCount || 0) > 10 && (
                                                <span className="flex items-center text-xs text-amber-600 dark:text-amber-400">
                                                    <TrendingUp className="h-3 w-3 mr-0.5" />
                                                    Popular
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="px-4 py-3 border-t border-white/10 bg-white/5 flex justify-between items-center">
                                    <button
                                        onClick={() => handleToggleActive(status)}
                                        className={`flex items-center px-3 py-1.5 rounded-lg text-xs transition-all duration-300 ${status.isActive
                                                ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40"
                                                : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/40"
                                            }`}
                                    >
                                        {status.isActive ? (
                                            <>
                                                <EyeOff className="h-3.5 w-3.5 mr-1" /> Deactivate
                                            </>
                                        ) : (
                                            <>
                                                <Eye className="h-3.5 w-3.5 mr-1" /> Activate
                                            </>
                                        )}
                                    </button>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleToggleFeatured(status)}
                                            className={`px-3 py-1.5 rounded-lg text-xs flex items-center transition-colors ${status.featured
                                                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800/40"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                                }`}
                                            title={status.featured ? "Remove from featured" : "Add to featured"}
                                        >
                                            <Star className="h-3.5 w-3.5" />
                                        </button>

                                        <Link
                                            href={`/admin/social-status/edit?id=${status._id}`}
                                            className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-lg text-xs flex items-center hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
                                        >
                                            <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                                        </Link>

                                        <Link
                                            href={`/admin/social-status/delete?id=${status._id}`}
                                            className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg text-xs flex items-center hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}

            {!isLoading && !error && sortedStatuses.length > 0 && (
                <div className="mt-10 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                        <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-500" />
                        Status Summary
                    </h3>

                    <div className="flex flex-wrap gap-4">
                        <div className="bg-white/5 rounded-lg border border-white/10 p-4 flex-1 min-w-[200px]">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">By Type</h4>
                            <div className="space-y-2">
                                {(['text', 'image', 'video'] as const).map(type => {
                                    const count = filteredStatuses.filter((s: Status) => s.type === type).length;
                                    const percentage = filteredStatuses.length > 0
                                        ? Math.round((count / filteredStatuses.length) * 100)
                                        : 0;

                                    return (
                                        <div key={type} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                {type === 'text' ? (
                                                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                                ) : type === 'image' ? (
                                                    <ImageIcon className="h-4 w-4 mr-2 text-green-500" />
                                                ) : (
                                                    <Film className="h-4 w-4 mr-2 text-purple-500" />
                                                )}
                                                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{type}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 mr-2">{count}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">({percentage}%)</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-lg border border-white/10 p-4 flex-1 min-w-[200px]">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">By Status</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Eye className="h-4 w-4 mr-2 text-emerald-500" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 mr-2">
                                            {filteredStatuses.filter((s: Status) => s.isActive).length}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            ({filteredStatuses.length > 0
                                                ? Math.round((filteredStatuses.filter((s: Status) => s.isActive).length / filteredStatuses.length) * 100)
                                                : 0}%)
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <EyeOff className="h-4 w-4 mr-2 text-red-500" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Inactive</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 mr-2">
                                            {filteredStatuses.filter((s: Status) => !s.isActive).length}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            ({filteredStatuses.length > 0
                                                ? Math.round((filteredStatuses.filter((s: Status) => !s.isActive).length / filteredStatuses.length) * 100)
                                                : 0}%)
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Star className="h-4 w-4 mr-2 text-amber-500" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Featured</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 mr-2">
                                            {filteredStatuses.filter((s: Status) => s.featured).length}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            ({filteredStatuses.length > 0
                                                ? Math.round((filteredStatuses.filter((s: Status) => s.featured).length / filteredStatuses.length) * 100)
                                                : 0}%)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-lg border border-white/10 p-4 flex-1 min-w-[200px]">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">By Usage</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <TrendingUp className="h-4 w-4 mr-2 text-amber-500" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Popular (10+ uses)</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {filteredStatuses.filter((s: Status) => (s.usageCount || 0) > 10).length}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Users className="h-4 w-4 mr-2 text-purple-500" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Used</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {filteredStatuses.filter((s: Status) => (s.usageCount || 0) > 0).length}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Unused</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {filteredStatuses.filter((s: Status) => !(s.usageCount || 0)).length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}