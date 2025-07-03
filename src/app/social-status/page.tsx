"use client";

import React, { useState, useEffect, useRef } from "react";
import NextImage from "next/image";
import VideoThumbnail from "./VideoThumbnail";
import {
    Search,
    Download,
    Star,
    Share2,
    Copy,
    Check,
    ArrowRight,
    Tag as TagIcon,
    Folder,
    FileText,
    Image as ImageIcon,
    Film,
    LinkIcon,
    ChevronLeft,
    ChevronRight,
    X
} from "lucide-react";
import { useStatusStore } from "@/store/statusStore";
import { Status } from "@/lib/types";

export default function SocialStatusPage() {
    const { statuses, fetchStatuses, fetchCategories, categories, isLoading, error } = useStatusStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [selectedTag, setSelectedTag] = useState<string>("");
    const [typeFilter, setTypeFilter] = useState<"all" | "text" | "image" | "video">("all");
    const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showShareOptions, setShowShareOptions] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);
    const [downloadStarted, setDownloadStarted] = useState<boolean>(false);
    const [favoriteStatuses, setFavoriteStatuses] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<"grid" | "carousel">("grid");
    const [currentCarouselIndex, setCurrentCarouselIndex] = useState<number>(0);

    const carouselRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null); // Add ref for video element

    // const allTags = [...new Set(statuses.flatMap(status => status.tags || []))];

    useEffect(() => {
        fetchStatuses(true);
        fetchCategories();
        const savedFavorites = localStorage.getItem('favoriteStatuses');
        if (savedFavorites) {
            setFavoriteStatuses(JSON.parse(savedFavorites));
        }
    }, [fetchStatuses, fetchCategories]);

    useEffect(() => {
        localStorage.setItem('favoriteStatuses', JSON.stringify(favoriteStatuses));
    }, [favoriteStatuses]);

    // Auto-play video when modal opens with video status
    useEffect(() => {
        if (selectedStatus?.type === 'video' && videoRef.current) {
            videoRef.current.play().catch(error => {
                console.error('Auto-play failed:', error);
            });
        }
    }, [selectedStatus]);

    const filteredStatuses = statuses.filter(status => {
        const matchesSearch = status.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? status.category === selectedCategory : true;
        const matchesType = typeFilter === "all" ? true : status.type === typeFilter;
        const matchesTag = selectedTag ? (status.tags || []).includes(selectedTag) : true;
        return matchesSearch && matchesCategory && matchesType && matchesTag;
    });

    const sortedStatuses = [...filteredStatuses].sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
    });

    const handlePrevSlide = () => {
        setCurrentCarouselIndex(prev => prev > 0 ? prev - 1 : sortedStatuses.length - 1);
    };

    const handleNextSlide = () => {
        setCurrentCarouselIndex(prev => prev < sortedStatuses.length - 1 ? prev + 1 : 0);
    };

    useEffect(() => {
        if (viewMode === 'carousel' && carouselRef.current) {
            const container = carouselRef.current;
            const slides = container.querySelectorAll('.carousel-slide');
            if (slides[currentCarouselIndex]) {
                slides[currentCarouselIndex].scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
    }, [currentCarouselIndex, viewMode]);

    const toggleFavorite = (statusId: string) => {
        setFavoriteStatuses(prev => {
            if (prev.includes(statusId)) {
                return prev.filter(id => id !== statusId);
            } else {
                return [...prev, statusId];
            }
        });
    };

    const trackStatusUsage = async (statusId: string) => {
        try {
            await fetch(`/api/statuses/${statusId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
                 },
                body: JSON.stringify({ incrementUsage: true }),
            });
        } catch (error) {
            console.error('Failed to track status usage:', error);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const downloadImage = async (status: Status) => {
        if (!status.mediaUrl) return;
        try {
            setDownloadStarted(true);
            const link = document.createElement('a');
            link.href = status.mediaUrl;
            link.download = `status-${status._id}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            await trackStatusUsage(status._id);
            setTimeout(() => setDownloadStarted(false), 2000);
        } catch (error) {
            console.error('Failed to download image:', error);
            setDownloadStarted(false);
        }
    };

    const shareStatus = async (status: Status) => {
        try {
            const shareData: { title: string; text: string; url?: string; } = {
                title: 'Check out this status!',
                text: status.content,
            };
            if (status.mediaUrl) shareData.url = status.mediaUrl;
            if (navigator.share && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                await trackStatusUsage(status._id);
            } else {
                setShowShareOptions(true);
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const renderStatusContent = (status: Status, large = false) => {
        switch (status.type) {
            case 'text':
                return (
                    <div
                        className={`rounded-lg overflow-hidden p-6 flex items-center justify-center ${large ? 'aspect-square w-full max-w-lg mx-auto' : 'aspect-square w-full'}`}
                        style={{
                            backgroundColor: status.backgroundColor || '#111827',
                            color: status.textColor || '#ffffff',
                            fontFamily: status.fontFamily || 'Arial'
                        }}
                    >
                        <p className="text-center" style={{ fontSize: `${status.fontSize || 24}px` }}>
                            {status.content}
                        </p>
                    </div>
                );
            case 'image':
                return status.mediaUrl ? (
                    <div className={`rounded-lg overflow-hidden ${large ? 'max-w-lg mx-auto' : 'w-full'}`}>
                        <NextImage
                            src={status.mediaUrl}
                            alt={status.content}
                            width={large ? 500 : 300}
                            height={large ? 500 : 300}
                            className={`${large ? 'max-h-[70vh] w-auto object-contain mx-auto' : 'w-full h-full object-cover aspect-square'}`}
                        />
                    </div>
                ) : (
                    <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center ${large ? 'w-full max-w-lg mx-auto aspect-square' : 'aspect-square w-full'}`}>
                        <ImageIcon className="h-20 w-20 text-gray-400" />
                    </div>
                );
            case 'video':
                if (status.mediaUrl) {
                    if (large) {
                        return (
                            <div className="rounded-lg overflow-hidden max-w-lg mx-auto">
                                <div className="relative aspect-video bg-black">
                                    <video
                                        ref={videoRef}
                                        src={status.mediaUrl}
                                        controls
                                        autoPlay // Enable auto-play
                                        muted // Muted to comply with browser auto-play policies
                                        className="w-full h-full object-contain"
                                        poster={status.thumbnailUrl}
                                        preload="metadata"
                                        playsInline
                                    />
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                                    <Film className="h-4 w-4 mr-2 text-purple-500" />
                                    {status.duration || "Video"}
                                </div>
                            </div>
                        );
                    }
                    return (
                        <div className="rounded-lg overflow-hidden w-full aspect-square bg-gray-900">
                            <VideoThumbnail
                                videoUrl={status.mediaUrl}
                                alt={status.content}
                                onClick={() => { setSelectedStatus(status); setShowModal(true); }}
                            />
                        </div>
                    );
                }
                return (
                    <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center ${large ? 'w-full max-w-lg mx-auto aspect-video' : 'aspect-square w-full'}`}>
                        <Film className="h-20 w-20 text-gray-400" />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Social Statuses</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
                            Find and share the perfect status for your social media
                        </p>
                        <div className="flex space-x-2 mt-4 sm:mt-0">
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`} aria-label="Grid View">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button onClick={() => setViewMode('carousel')} className={`p-2 rounded-lg ${viewMode === 'carousel' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`} aria-label="Carousel View">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input type="text" placeholder="Search statuses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 w-full bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200" />
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as "all" | "text" | "image" | "video")} className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="all">All Types</option>
                                <option value="text">Text</option>
                                <option value="image">Images</option>
                                <option value="video">Videos</option>
                            </select>
                            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category._id} value={category.name}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="relative w-12 h-12">
                            <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                            <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
                        </div>
                    </div>
                )}
                {!isLoading && error && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-300 dark:border-red-900/50 shadow-lg p-6 text-center max-w-md mx-auto">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4">
                            <X className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Error Loading Statuses</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                        <button onClick={() => fetchStatuses(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center">
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Try Again
                        </button>
                    </div>
                )}
                {!isLoading && !error && sortedStatuses.length === 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-8 text-center max-w-md mx-auto">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 mb-4">
                            <Search className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                            {searchTerm || selectedCategory || selectedTag || typeFilter !== 'all' ? "No matching statuses found" : "No statuses available"}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {searchTerm || selectedCategory || selectedTag || typeFilter !== 'all' ? "Try adjusting your filters or search term to find statuses." : "There are no statuses available at the moment. Please check back later."}
                        </p>
                        {(searchTerm || selectedCategory || selectedTag || typeFilter !== 'all') && (
                            <button onClick={() => { setSearchTerm(""); setSelectedCategory(""); setSelectedTag(""); setTypeFilter("all"); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center">
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}
                {!isLoading && !error && viewMode === 'grid' && sortedStatuses.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {sortedStatuses.map((status) => (
                            <div key={status._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
                                <div className="relative">
                                    <div onClick={() => { setSelectedStatus(status); setShowModal(true); }} className="cursor-pointer">
                                        {renderStatusContent(status)}
                                    </div>
                                    {status.featured && (
                                        <div className="absolute top-2 left-2 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-400 rounded-full px-2 py-0.5 text-xs font-medium flex items-center">
                                            <Star className="h-3 w-3 mr-1" />
                                            Featured
                                        </div>
                                    )}
                                    <button onClick={() => toggleFavorite(status._id)} className={`absolute top-2 right-2 p-1.5 rounded-full ${favoriteStatuses.includes(status._id) ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' : 'bg-white/70 dark:bg-black/40 text-gray-700 dark:text-gray-300 hover:text-red-500'}`} aria-label={favoriteStatuses.includes(status._id) ? "Remove from favorites" : "Add to favorites"}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={favoriteStatuses.includes(status._id) ? "currentColor" : "none"} stroke="currentColor" className="h-4 w-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                            {status.type === 'text' ? <FileText className="h-3 w-3 mr-1 text-blue-500" /> : status.type === 'image' ? <ImageIcon className="h-3 w-3 mr-1 text-green-500" /> : <Film className="h-3 w-3 mr-1 text-purple-500" />}
                                            <span className="capitalize">{status.type}</span>
                                        </div>
                                        <div className="flex items-center text-xs bg-gray-100 dark:bg-gray-700 rounded px-2 py-0.5">
                                            <Folder className="h-3 w-3 mr-1" />
                                            <span className="truncate max-w-[80px]">{status.category}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-800 dark:text-white line-clamp-2 mb-2">{status.content}</p>
                                    {status.tags && status.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {status.tags.slice(0, 3).map((tag) => (
                                                <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">#{tag}</span>
                                            ))}
                                            {status.tags.length > 3 && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">+{status.tags.length - 3}</span>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                                        <button onClick={() => { setSelectedStatus(status); setShowModal(true); }} className="text-blue-600 dark:text-blue-400 text-xs font-medium flex items-center hover:underline">
                                            Use Status <ArrowRight className="h-3 w-3 ml-1" />
                                        </button>
                                        <div className="flex space-x-2">
                                            <button onClick={() => shareStatus(status)} className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" aria-label="Share">
                                                <Share2 className="h-3.5 w-3.5" />
                                            </button>
                                            {status.type === 'text' && (
                                                <button onClick={() => { copyToClipboard(status.content); trackStatusUsage(status._id); }} className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-colors" aria-label="Copy to clipboard">
                                                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                                </button>
                                            )}
                                            {status.type === 'image' && (
                                                <button onClick={() => downloadImage(status)} className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" aria-label="Download">
                                                    {downloadStarted ? <Check className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {!isLoading && !error && viewMode === 'carousel' && sortedStatuses.length > 0 && (
                    <div className="relative pt-8 pb-12">
                        <div className="flex justify-between items-center mb-6">
                            <button onClick={handlePrevSlide} className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30" aria-label="Previous slide">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <div className="font-medium text-gray-800 dark:text-white">{currentCarouselIndex + 1} / {sortedStatuses.length}</div>
                            <button onClick={handleNextSlide} className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30" aria-label="Next slide">
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                        <div ref={carouselRef} className="overflow-hidden">
                            <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${currentCarouselIndex * 100}%)` }}>
                                {sortedStatuses.map((status) => (
                                    <div key={status._id} className="carousel-slide min-w-full px-4">
                                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center">
                                                    {status.type === 'text' ? <FileText className="h-5 w-5 mr-2 text-blue-500" /> : status.type === 'image' ? <ImageIcon className="h-5 w-5 mr-2 text-green-500" /> : <Film className="h-5 w-5 mr-2 text-purple-500" />}
                                                    <span className="text-gray-700 dark:text-gray-300 font-medium capitalize">{status.type} Status</span>
                                                </div>
                                                <button onClick={() => toggleFavorite(status._id)} className={`p-1.5 rounded-full ${favoriteStatuses.includes(status._id) ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-red-500'}`} aria-label={favoriteStatuses.includes(status._id) ? "Remove from favorites" : "Add to favorites"}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={favoriteStatuses.includes(status._id) ? "currentColor" : "none"} stroke="currentColor" className="h-5 w-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="mb-6">{renderStatusContent(status, true)}</div>
                                            <div className="space-y-4">
                                                <p className="text-gray-800 dark:text-white">{status.content}</p>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm">
                                                        <Folder className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" />
                                                        <span className="text-gray-700 dark:text-gray-300">{status.category}</span>
                                                    </div>
                                                    {status.tags && status.tags.length > 0 && status.tags.map(tag => (
                                                        <div key={tag} className="flex items-center bg-blue-50 dark:bg-blue-900/20 rounded-full px-3 py-1 text-sm text-blue-700 dark:text-blue-400">
                                                            <TagIcon className="h-3 w-3 mr-1" />
                                                            <span>#{tag}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                    {status.type === 'text' && (
                                                        <button onClick={() => { copyToClipboard(status.content); trackStatusUsage(status._id); }} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center hover:bg-blue-700 transition-colors">
                                                            <Copy className="h-4 w-4 mr-1.5" />
                                                            {copied ? 'Copied!' : 'Copy Text'}
                                                        </button>
                                                    )}
                                                    {status.type === 'image' && (
                                                        <button onClick={() => downloadImage(status)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center hover:bg-blue-700 transition-colors">
                                                            <Download className="h-4 w-4 mr-1.5" />
                                                            {downloadStarted ? 'Downloaded!' : 'Download Image'}
                                                        </button>
                                                    )}
                                                    <button onClick={() => shareStatus(status)} className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium flex items-center hover:bg-purple-700 transition-colors">
                                                        <Share2 className="h-4 w-4 mr-1.5" />
                                                        Share
                                                    </button>
                                                    {status.type === 'text' && (
                                                        <button onClick={() => { const statusText = encodeURIComponent(status.content); const url = `https://twitter.com/intent/tweet?text=${statusText}`; window.open(url, '_blank'); trackStatusUsage(status._id); }} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium flex items-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                                            <svg className="h-4 w-4 mr-1.5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                                            </svg>
                                                            Post to Twitter
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-center mt-6 space-x-2">
                            {sortedStatuses.map((_, index) => (
                                <button key={index} onClick={() => setCurrentCarouselIndex(index)} className={`w-2 h-2 rounded-full ${index === currentCarouselIndex ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`} aria-label={`Go to slide ${index + 1}`} />
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {selectedStatus && showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" aria-hidden="true" onClick={() => { setSelectedStatus(null); setShowModal(false); }}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"></span>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                            <div className="absolute top-0 right-0 pt-4 pr-4">
                                <button type="button" className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none" onClick={() => { setSelectedStatus(null); setShowModal(false); }}>
                                    <span className="sr-only">Close</span>
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Use This Status</h3>
                                        <div className="mt-2">
                                            <div className="mb-6">{renderStatusContent(selectedStatus, true)}</div>
                                            <div className="space-y-4">
                                                <p className="text-gray-600 dark:text-gray-300">{selectedStatus.content}</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                                                    {selectedStatus.type === 'text' && (
                                                        <button onClick={() => { copyToClipboard(selectedStatus.content); trackStatusUsage(selectedStatus._id); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center justify-center hover:bg-blue-700 transition-colors">
                                                            <Copy className="h-4 w-4 mr-1.5" />
                                                            {copied ? 'Copied!' : 'Copy to Clipboard'}
                                                        </button>
                                                    )}
                                                    {selectedStatus.type === 'image' && (
                                                        <button onClick={() => downloadImage(selectedStatus)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center justify-center hover:bg-blue-700 transition-colors">
                                                            <Download className="h-4 w-4 mr-1.5" />
                                                            {downloadStarted ? 'Downloaded!' : 'Download Image'}
                                                        </button>
                                                    )}
                                                    {selectedStatus.type === 'video' && (
                                                        <button onClick={() => { if (selectedStatus.mediaUrl) { window.open(selectedStatus.mediaUrl, '_blank'); trackStatusUsage(selectedStatus._id); } }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center justify-center hover:bg-blue-700 transition-colors">
                                                            <Download className="h-4 w-4 mr-1.5" />
                                                            Open Video
                                                        </button>
                                                    )}
                                                    <button onClick={() => shareStatus(selectedStatus)} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium flex items-center justify-center hover:bg-purple-700 transition-colors">
                                                        <Share2 className="h-4 w-4 mr-1.5" />
                                                        Share
                                                    </button>
                                                    {showShareOptions && (
                                                        <div className="col-span-2 mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                                            <div className="flex justify-between items-center mb-3">
                                                                <h4 className="font-medium text-gray-700 dark:text-gray-300">Share Options</h4>
                                                                <button onClick={() => setShowShareOptions(false)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <button onClick={() => { const shareUrl = `${window.location.origin}/social-status?id=${selectedStatus._id}`; copyToClipboard(shareUrl); trackStatusUsage(selectedStatus._id); }} className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                    <LinkIcon className="h-4 w-4 mr-1.5 text-blue-500" />
                                                                    Copy Link
                                                                </button>
                                                                <button onClick={() => { const text = selectedStatus.content; const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`; window.open(url, '_blank'); trackStatusUsage(selectedStatus._id); }} className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                    <svg className="h-4 w-4 mr-1.5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                                                    </svg>
                                                                    Twitter
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-200 dark:bg-gray-600 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm" onClick={() => { setSelectedStatus(null); setShowModal(false); }}>
                                    Close
                                </button>
                                <button type="button" onClick={() => toggleFavorite(selectedStatus._id)} className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${favoriteStatuses.includes(selectedStatus._id) ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-800/40' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={favoriteStatuses.includes(selectedStatus._id) ? "currentColor" : "none"} stroke="currentColor" className="h-4 w-4 mr-1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    {favoriteStatuses.includes(selectedStatus._id) ? 'Remove from Favorites' : 'Add to Favorites'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}