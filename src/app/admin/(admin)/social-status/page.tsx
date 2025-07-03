"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    PlusCircle, FileText, Users, Layers, Medal, TrendingUp, BarChart3, Folder, FolderTree,
    ExternalLink, ChevronRight, Filter, RefreshCw, Clock, Bell, Calendar,
    Settings, Film, ImageIcon
} from "lucide-react";
import { useStatusStore } from "@/store/statusStore";

// Define proper TypeScript types
interface Status {
    _id: string;
    content: string;
    category?: string;
    usageCount: number;
}

interface Activity {
    id: string;
    type: string;
    content: string;
    usageCount: number;
    statusType: 'text' | 'image' | 'video';
    category: string;
    timestamp: string | number | Date;
}

interface WeeklyEngagement {
    day: string;
    usage: number;
}

interface TypeDistribution {
    type: 'text' | 'image' | 'video';
    count: number;
    usage: number;
}

interface StatusStats {
    totalStatuses: number;
    activeStatuses: number;
    totalUsage: number;
    topStatuses: Status[];
    categoryCounts: { category: string; count: number }[];
    recentActivity: Activity[];
    weeklyEngagement: WeeklyEngagement[];
    typeDistribution: TypeDistribution[];
}

// Define QuickActionCard props
interface QuickActionCardProps {
    Icon: React.ElementType;
    title: string;
    description?: string;
    link: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ Icon, title, description, link }) => (
    <Link
        href={link}
        className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 hover:from-emerald-500/10 hover:to-blue-500/10 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
    >
        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full mb-3">
            <Icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h4 className="text-sm font-medium text-gray-800 dark:text-white">{title}</h4>
        {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">{description}</p>
        )}
    </Link>
);

// Define CategoryDistribution props
interface CategoryDistributionProps {
    categories: { category: string; count: number }[];
    totalStatuses: number;
}

// const EngagementChart = () => {
//     // Generate consistent sample data
//     const chartData = React.useMemo(() => {
//         return [
//             { day: 'Mon', users: 42 },
//             { day: 'Tue', users: 63 },
//             { day: 'Wed', users: 49 },
//             { day: 'Thu', users: 78 },
//             { day: 'Fri', users: 52 },
//             { day: 'Sat', users: 43 },
//             { day: 'Sun', users: 60 }
//         ];
//     }, []);

//     // Calculate the maximum value for scaling
//     const maxValue = Math.max(...chartData.map(item => item.users));

//     return (
//         <div className="w-full h-full flex flex-col">
//             {/* Chart title and legend */}
//             <div className="flex justify-between items-center mb-4">
//                 <div className="text-xs font-medium text-gray-400">Daily Engagement</div>
//                 <div className="flex items-center space-x-4">
//                     <div className="flex items-center">
//                         <div className="w-3 h-3 bg-emerald-500 rounded-sm mr-1"></div>
//                         <span className="text-xs text-gray-400">Uses</span>
//                     </div>
//                 </div>
//             </div>

//             {/* Chart content */}
//             <div className="flex-1 flex items-end justify-between gap-2">
//                 {chartData.map((item, index) => {
//                     const height = `${(item.users / maxValue) * 100}%`;

//                     return (
//                         <div key={index} className="flex-1 flex flex-col items-center h-full">
//                             <div className="relative w-full h-full flex items-end">
//                                 <div 
//                                     className="w-full max-w-[30px] mx-auto bg-emerald-500 rounded-t-sm hover:bg-emerald-400 transition-colors"
//                                     style={{ height }}
//                                 >
//                                     <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none">
//                                         {item.users} uses
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="mt-2 text-xs text-gray-500">{item.day}</div>
//                         </div>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// };

const CategoryDistribution: React.FC<CategoryDistributionProps> = ({ categories, totalStatuses }) => {
    if (categories.length === 0) return null;

    const sortedCategories = [...categories].sort((a, b) => b.count - a.count);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sortedCategories.map((item, index) => {
                const percentage = Math.min(100, (item.count / (totalStatuses || 1)) * 100);
                const colorIndex = index % 5;
                const gradientClasses = [
                    "from-emerald-500/20 to-emerald-600/20",
                    "from-blue-500/20 to-blue-600/20",
                    "from-purple-500/20 to-purple-600/20",
                    "from-amber-500/20 to-amber-600/20",
                    "from-cyan-500/20 to-cyan-600/20"
                ];

                return (
                    <div
                        key={item.category}
                        className="p-4 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <div className={`h-8 w-8 rounded-md bg-gradient-to-br ${gradientClasses[colorIndex]} flex items-center justify-center mr-3`}>
                                    <Folder className="h-4 w-4 text-white" />
                                </div>
                                <h4 className="font-medium text-gray-800 dark:text-white truncate max-w-[150px]">{item.category}</h4>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-white/10 text-white border border-white/20">
                                {item.count}
                            </span>
                        </div>
                        <div className="mt-3 space-y-1">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className={`bg-gradient-to-r ${gradientClasses[colorIndex].replace('/20', '/80')} h-2.5 rounded-full`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                                <span>{item.count} statuses</span>
                                <span>{percentage.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Define StatCard props
interface StatCardProps {
    icon: React.ElementType;
    title: string;
    value?: number;
    description?: string;
    linkText?: string;
    linkHref?: string;
    isLoading: boolean;
    gradient?: string;
    iconBg?: string;
    iconColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    icon: Icon,
    title,
    value,
    description,
    linkText,
    linkHref,
    isLoading,
    gradient = "from-emerald-500/5 to-blue-500/5",
    iconBg = "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor = "text-emerald-600 dark:text-emerald-400"
}) => (
    <div className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br ${gradient}`}>
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                    {isLoading ? (
                        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ) : (
                        value ?? 0
                    )}
                </h3>
                {description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {isLoading ? "..." : description}
                    </p>
                )}
            </div>
            <div className={`${iconBg} p-3 rounded-lg`}>
                <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
        </div>
        {linkText && linkHref && (
            <div className="mt-4">
                <Link href={linkHref} className={`text-xs ${iconColor} hover:underline inline-flex items-center`}>
                    {linkText}
                    <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
            </div>
        )}
    </div>
);

export default function StatusAdminPage() {
    const { fetchStats } = useStatusStore();
    const [stats, setStats] = useState<StatusStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilter, setShowFilter] = useState(false);
    const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "all">("all");
    const [lastRefreshed, setLastRefreshed] = useState(new Date());

    useEffect(() => {
        const loadStats = async () => {
            try {
                setIsLoading(true);
                const result = await fetchStats();
                // Fix: Don't check truthiness of result
                setStats(result as unknown as StatusStats | null);
                setLastRefreshed(new Date());
            } catch (error) {
                console.error('Error fetching stats:', error);
                setStats(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadStats();
    }, [fetchStats, timeRange]); // Add timeRange to trigger reload on filter change

    const filteredTopStatuses = stats?.topStatuses?.filter(status =>
        status.content.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleRefresh = async () => {
        try {
            setIsLoading(true);
            const result = await fetchStats();
            // Fix: Don't check truthiness of result
            setStats(result as unknown as StatusStats | null);
            setLastRefreshed(new Date());
        } catch (error) {
            console.error('Error refreshing stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header section */}
            <div className="relative rounded-2xl overflow-hidden mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-sm"></div>
                <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-emerald-500/20 blur-3xl"></div>
                <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-blue-500/20 blur-3xl"></div>

                <div className="relative py-8 px-6 md:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Social Status Dashboard</h2>
                            <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl">
                                Create and monitor social media statuses across your platform
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search statuses..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full sm:w-64 px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>
                            <Link
                                href="/admin/social-status/create"
                                className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 shadow-lg"
                            >
                                <PlusCircle className="h-4 w-4 mr-2" /> New Status
                            </Link>
                        </div>
                    </div>
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <Clock className="h-4 w-4" />
                            <span>Last updated: {lastRefreshed.toLocaleTimeString()}</span>
                            <button
                                onClick={handleRefresh}
                                className="ml-2 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                disabled={isLoading}
                            >
                                <RefreshCw className={`h-4 w-4 text-emerald-500 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowFilter(!showFilter)}
                                className="inline-flex items-center px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300"
                            >
                                <Filter className="h-4 w-4 mr-2" /> Filters
                            </button>
                            {/* <button className="inline-flex items-center px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300">
                                <Download className="h-4 w-4 mr-2" /> Export
                            </button> */}
                        </div>
                    </div>
                    {showFilter && (
                        <div className="mt-4 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 animate-fadeIn">
                            <div className="flex flex-wrap items-center gap-4">
                                <div>
                                    <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">Time Range</label>
                                    <select
                                        value={timeRange}
                                        onChange={(e) => setTimeRange(e.target.value as "day" | "week" | "month" | "all")}
                                        className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option className="text-black font-medium" value="day">Today</option>
                                        <option className="text-black font-medium" value="week">This Week</option>
                                        <option className="text-black font-medium" value="month">This Month</option>
                                        <option className="text-black font-medium" value="all">All Time</option>
                                    </select>
                                </div>
                                {/* Add more filters as needed */}
                                <div className="self-end">
                                    <button className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300">
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    icon={FileText}
                    title="Total Statuses"
                    value={stats?.totalStatuses}
                    description="All created statuses"
                    linkText="View all statuses"
                    linkHref="/admin/social-status/all"
                    isLoading={isLoading}
                />
                <StatCard
                    icon={Layers}
                    title="Active Statuses"
                    value={stats?.activeStatuses}
                    description="Available on user interface"
                    isLoading={isLoading}
                    gradient="from-blue-500/5 to-blue-600/5"
                    iconBg="bg-blue-100 dark:bg-blue-900/30"
                    iconColor="text-blue-600 dark:text-blue-400"
                />
                <StatCard
                    icon={Users}
                    title="Total Usage"
                    value={stats?.totalUsage}
                    description="Total shares by users"
                    isLoading={isLoading}
                    gradient="from-purple-500/5 to-purple-600/5"
                    iconBg="bg-purple-100 dark:bg-purple-900/30"
                    iconColor="text-purple-600 dark:text-purple-400"
                />
                <StatCard
                    icon={Calendar}
                    title="Usage Today"
                    value={stats?.totalUsage}
                    description={`${stats?.totalUsage ? Math.round((stats.totalUsage / (stats.totalUsage || 1)) * 100) : 0}% of total usage`}
                    isLoading={isLoading}
                    gradient="from-amber-500/5 to-amber-600/5"
                    iconBg="bg-amber-100 dark:bg-amber-900/30"
                    iconColor="text-amber-600 dark:text-amber-400"
                />
            </div>

            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Most Popular Statuses */}
                    {stats?.topStatuses && stats.topStatuses.length > 0 && (
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center">
                                    <Medal className="h-5 w-5 text-amber-500 mr-2" />
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Most Popular Statuses</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select className="text-xs bg-white/10 border border-white/20 rounded-md px-2 py-1 text-gray-800 dark:text-white">
                                        <option value="usage">By Usage</option>
                                        <option value="recent">Most Recent</option>
                                        <option value="alphabetical">Alphabetical</option>
                                    </select>
                                </div>
                            </div>
                            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-white/5">
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Content</th>
                                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usage</th>
                                            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {isLoading ? (
                                            Array(3).fill(0).map((_, i) => (
                                                <tr key={i} className="bg-white/0 hover:bg-white/5 transition-colors">
                                                    <td className="py-3 px-4"><div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div></td>
                                                    <td className="py-3 px-4"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></td>
                                                    <td className="py-3 px-4 text-center"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div></td>
                                                    <td className="py-3 px-4 text-center"><div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div></td>
                                                    <td className="py-3 px-4 text-right"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto"></div></td>
                                                </tr>
                                            ))
                                        ) : filteredTopStatuses.length > 0 ? (
                                            filteredTopStatuses.map((status, index) => (
                                                <tr key={status._id} className="bg-white/0 hover:bg-white/5 transition-colors">
                                                    <td className="py-3 px-4">
                                                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium 
                                                            ${index === 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-500/30' :
                                                                index === 1 ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 border border-gray-500/30' :
                                                                    index === 2 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border border-yellow-500/30' :
                                                                        'bg-white/10 text-gray-600 dark:text-gray-400 border border-white/20'}`}>
                                                            {index + 1}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 font-medium text-gray-800 dark:text-white">
                                                        <div className="truncate max-w-xs">{status.content}</div>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400">
                                                            {status.category || "General"}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400">
                                                            <TrendingUp className="h-3 w-3 mr-1" /> {status.usageCount}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            {/* <Link href={`/admin/social-status/view?id=${status._id}`} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="View Details">
                                                                <Eye className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                                            </Link> */}
                                                            <Link href={`/admin/social-status/edit?id=${status._id}`} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Edit Status">
                                                                <Settings className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="py-6 text-center text-gray-500 dark:text-gray-400">No statuses found matching your search.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-6 py-3 border-t border-white/10 bg-white/5">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Showing top {filteredTopStatuses.length} of {stats?.totalStatuses ?? 0} statuses
                                    </p>
                                    <Link href="/admin/social-status/all" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center">
                                        View all statuses <ChevronRight className="h-3 w-3 ml-1" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Category Distribution */}
                    {stats?.categoryCounts && stats.categoryCounts.length > 0 && (
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center">
                                    <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Category Distribution</h3>
                                </div>
                                <Link href="/admin/social-status/categories" className="inline-flex items-center px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-xs font-medium hover:bg-white/20 transition-all duration-300">
                                    <FolderTree className="h-3.5 w-3.5 mr-1.5" /> Manage Categories
                                </Link>
                            </div>
                            <div className="p-6">
                                <CategoryDistribution categories={stats.categoryCounts} totalStatuses={stats.totalStatuses} />
                            </div>
                        </div>
                    )}

                    {/* Recent Activity */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center">
                                <Bell className="h-5 w-5 text-purple-500 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Activity</h3>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-400 border border-white/20">Last 24 hours</span>
                        </div>
                        <div className="p-4">
                            <div className="relative">
                                <div className="absolute top-3 bottom-0 left-3 w-0.5 bg-white/10"></div>
                                <div className="space-y-6 relative ml-10">
                                    {isLoading ? (
                                        Array(3).fill(0).map((_, i) => (
                                            <div key={i} className="flex items-start">
                                                <div className="absolute -left-10 mt-1"><div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div></div>
                                                <div className="flex-1">
                                                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                                                    <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                                </div>
                                            </div>
                                        ))
                                    ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
                                        stats.recentActivity.slice(0, 3).map((activity) => {
                                            let IconComponent, bgColorClass, iconColorClass, title, description;
                                            if (activity.type === 'high_usage') {
                                                IconComponent = Users;
                                                bgColorClass = "bg-blue-100 dark:bg-blue-900/30";
                                                iconColorClass = "text-blue-500 dark:text-blue-400";
                                                title = "Status usage spike";
                                                description = `"${activity.content.substring(0, 30)}${activity.content.length > 30 ? '...' : ''}" shared ${activity.usageCount} times`;
                                            } else {
                                                IconComponent = activity.statusType === 'text' ? FileText : activity.statusType === 'image' ? ImageIcon : Film;
                                                bgColorClass = "bg-purple-100 dark:bg-purple-900/30";
                                                iconColorClass = "text-purple-500 dark:text-purple-400";
                                                title = "Status updated";
                                                description = `"${activity.content.substring(0, 30)}${activity.content.length > 30 ? '...' : ''}" in ${activity.category}`;
                                            }
                                            const timestamp = new Date(activity.timestamp);
                                            const now = new Date();
                                            const diffHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
                                            const timeAgo = diffHours < 1 ? "Just now" : diffHours < 24 ? `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago` : diffHours < 48 ? "Yesterday" : timestamp.toLocaleDateString();

                                            return (
                                                <div key={activity.id} className="flex items-start">
                                                    <div className="absolute -left-10 mt-1">
                                                        <div className={`h-6 w-6 rounded-full ${bgColorClass} flex items-center justify-center`}>
                                                            <IconComponent className={`h-3 w-3 ${iconColorClass}`} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-800 dark:text-white">{title}</h4>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
                                                        <span className="text-xs text-gray-400 mt-1 inline-block">{timeAgo}</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center text-gray-500 dark:text-gray-400 py-4">No recent activity found</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Engagement Trends */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center">
                                <TrendingUp className="h-5 w-5 text-emerald-500 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Status Engagement Trends</h3>
                            </div>
                            <select
                                className="text-xs bg-white/10 border border-white/20 rounded-md px-2 py-1 text-gray-800 dark:text-white"
                                onChange={(e) => setTimeRange(e.target.value as "day" | "week" | "month" | "all")}
                                value={timeRange}
                            >
                                <option value="week">Last 7 Days</option>
                                <option value="month">Last 30 Days</option>
                                <option value="all">All Time</option>
                            </select>
                        </div>
                        <div className="p-6">
                            {isLoading ? (
                                <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            ) : (
                                <div>
                                    <div className="w-full h-64 bg-white/5 rounded-lg border border-white/10 p-4">
                                        {stats?.weeklyEngagement && stats.weeklyEngagement.length > 0 ? (
                                            <div className="w-full h-full flex flex-col">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="text-xs font-medium text-gray-400">Daily Usage</div>
                                                    <div className="flex items-center">
                                                        <div className="w-3 h-3 bg-emerald-500 rounded-sm mr-1"></div>
                                                        <span className="text-xs text-gray-400">Status Uses</span>
                                                    </div>
                                                </div>

                                                <div className="flex-1 flex items-end justify-between gap-2">
                                                    {stats.weeklyEngagement.map((item, index) => {
                                                        // Find the maximum usage value to scale the chart
                                                        const maxUsage = Math.max(...stats.weeklyEngagement.map(d => d.usage), 1);
                                                        // Calculate height as a percentage (minimum 5% for visibility)
                                                        const heightPercentage = Math.max(5, (item.usage / maxUsage) * 100);

                                                        return (
                                                            <div key={index} className="flex-1 flex flex-col items-center h-full">
                                                                <div className="relative w-full h-full flex items-end">
                                                                    <div
                                                                        className="w-full max-w-[30px] mx-auto bg-emerald-500 rounded-t-sm hover:bg-emerald-400 transition-colors group relative"
                                                                        style={{ height: `${heightPercentage}%` }}
                                                                    >
                                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                                                            {item.usage} uses
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">{item.day}</div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-full flex items-center justify-center">
                                                <p className="text-gray-500 dark:text-gray-400">No engagement data available</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Weekly Total</div>
                                            <div className="text-2xl font-bold text-gray-800 dark:text-white">
                                                {stats?.weeklyEngagement ? stats.weeklyEngagement.reduce((sum, day) => sum + day.usage, 0) : 0}
                                                {stats?.weeklyEngagement && (
                                                    <span className="text-sm font-normal text-emerald-500 ml-2">
                                                        uses
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Daily Average</div>
                                            <div className="text-2xl font-bold text-gray-800 dark:text-white">
                                                {stats?.weeklyEngagement && stats.weeklyEngagement.length > 0
                                                    ? Math.round(stats.weeklyEngagement.reduce((sum, day) => sum + day.usage, 0) / stats.weeklyEngagement.length)
                                                    : 0}
                                                <span className="text-sm font-normal text-gray-400 ml-2">per day</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/10">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Quick Actions</h3>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-4">
                            <QuickActionCard Icon={PlusCircle} title="Create Status" description="Add a new social status" link="/admin/social-status/create" />
                            <QuickActionCard Icon={Layers} title="View All" description="Manage existing statuses" link="/admin/social-status/all" />
                            <QuickActionCard Icon={FolderTree} title="Categories" description="Manage status categories" link="/admin/social-status/categories" />
                            <QuickActionCard Icon={Users} title="User View" description="See the user experience" link="/social-status" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/10">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">UI Preview</h3>
                        </div>
                        <div className="p-6">
                            <div className="relative mx-auto w-full max-w-[220px] aspect-[9/16] rounded-3xl overflow-hidden border-8 border-gray-800 shadow-2xl mb-6">
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-950">
                                    <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-emerald-500/20 blur-xl"></div>
                                    <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-blue-500/20 blur-xl"></div>
                                    <div className="absolute inset-0 flex flex-col p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="h-2 w-16 bg-gray-700 rounded-full"></div>
                                            <div className="flex space-x-1">
                                                <div className="h-2 w-2 bg-gray-700 rounded-full"></div>
                                                <div className="h-2 w-2 bg-gray-700 rounded-full"></div>
                                                <div className="h-2 w-2 bg-gray-700 rounded-full"></div>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex items-center justify-center">
                                            <div className="w-full p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/10 flex flex-col items-center justify-center">
                                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-3">
                                                    <FileText className="w-5 h-5 text-emerald-400" />
                                                </div>
                                                <div className="h-2 w-24 bg-white/30 rounded-full mb-2"></div>
                                                <div className="h-2 w-16 bg-white/20 rounded-full"></div>
                                            </div>
                                        </div>
                                        <div className="mt-4 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg"></div>
                                    </div>
                                </div>
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-gray-800 rounded-b-xl"></div>
                            </div>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                                    The social status feature allows users to select and share pre-made content across their social profiles.
                                </p>
                                <div className="flex justify-center">
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

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/10">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Status Types</h3>
                        </div>
                        <div className="p-6">
                            {isLoading ? (
                                <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>)}</div>
                            ) : stats?.typeDistribution && stats.typeDistribution.length > 0 ? (
                                <div className="space-y-4">
                                    {(() => {
                                        const totalCount = stats.typeDistribution.reduce((sum, type) => sum + type.count, 0);
                                        const typeColors = {
                                            text: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500", icon: FileText },
                                            image: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", bar: "bg-blue-500", icon: ImageIcon },
                                            video: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400", bar: "bg-purple-500", icon: Film }
                                        };
                                        const sortedTypes = [...stats.typeDistribution].sort((a, b) => b.count - a.count);

                                        return sortedTypes.map((typeData) => {
                                            const percentage = totalCount > 0 ? Math.round((typeData.count / totalCount) * 100) : 0;
                                            const typeConfig = typeColors[typeData.type] || typeColors.text;
                                            const IconComponent = typeConfig.icon;

                                            return (
                                                <div key={typeData.type} className="p-3 rounded-lg bg-white/5 border border-white/10">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="flex items-center">
                                                            <div className={`p-1.5 ${typeConfig.bg} rounded-md mr-3`}>
                                                                <IconComponent className={`h-4 w-4 ${typeConfig.text}`} />
                                                            </div>
                                                            <span className="font-medium text-gray-800 dark:text-white capitalize">{typeData.type}</span>
                                                        </div>
                                                        <span className="text-sm text-gray-600 dark:text-gray-300">{percentage}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                                        <div className={`${typeConfig.bar} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                                                    </div>
                                                    <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                                        <span>{typeData.count} statuses</span>
                                                        <span>{typeData.usage} uses</span>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 dark:text-gray-400 py-4">No status type data available</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}