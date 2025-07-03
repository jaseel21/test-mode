"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Eye,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Sliders,
  Bell,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
} from "lucide-react";

interface Notification {
  _id: string;
  title?: string;
  body: string;
  subject?: string;
  channel: string;
  userGroup: string;
  status: string;
  sentAt: string;
  displayDate: string;
  scheduledFor?: string;
  deliveredCount: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  createdBy: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  totalItems: number;
  totalPages: number;
}

export default function TrackNotificationsPage() {
  const [searchText, setSearchText] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("sentAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage: number = 10;
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);
  const [notificationDetails, setNotificationDetails] = useState<Notification | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

  // Fetch notifications from API
  const fetchNotifications = useCallback(
    async (page: number) => {
      if (page < 1 || (totalPages > 0 && page > totalPages)) return;

      setIsLoading(true);

      try {
        const params = new URLSearchParams({
          search: searchText,
          channel: selectedChannel,
          status: selectedStatus,
          page: page.toString(),
          limit: itemsPerPage.toString(),
          sortBy: sortBy,
          sortOrder: sortOrder,
        });

        if (dateFrom) params.append("dateFrom", dateFrom);
        if (dateTo) params.append("dateTo", dateTo);

        console.log(`Fetching notifications for page ${page}`);

        const response = await fetch(`/api/notifications/history?${params.toString()}`, {
          headers: {
            "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data: NotificationsResponse = await response.json();

        console.log(`Received data for page ${page}:`, {
          notifications: data.notifications.length,
          totalItems: data.totalItems,
          totalPages: data.totalPages,
        });

        setNotifications(data.notifications);
        setTotalItems(data.totalItems);
        setTotalPages(data.totalPages);
        setCurrentPage(page);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [searchText, selectedChannel, selectedStatus, dateFrom, dateTo, sortBy, sortOrder]
  );

  // Debounce function for filter changes
  const debounce = useCallback((fn: () => void, delay: number) => {
    let timeout: NodeJS.Timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(fn, delay);
    };
  }, []);

  // Debounced fetch for filter changes
  const debouncedFetchNotifications = useMemo(
    () => debounce(() => fetchNotifications(1), 500),
    [fetchNotifications]
  );

  // Fetch notifications on mount only once
  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      fetchNotifications(1);
    }

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array for mount-only fetch

  // Fetch notifications when sorting changes
  useEffect(() => {
    fetchNotifications(currentPage);
  }, [sortBy, sortOrder, fetchNotifications]);

  // Trigger debounced fetch when filter states change
  useEffect(() => {
    debouncedFetchNotifications();
  }, [searchText, selectedChannel, selectedStatus, dateFrom, dateTo, debouncedFetchNotifications]);

  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchNotifications(page);
  };

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (start === 2) end = Math.min(4, totalPages - 1);
      if (end === totalPages - 1) start = Math.max(2, totalPages - 3);

      if (start > 2) pages.push("ellipsis1");

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) pages.push("ellipsis2");
      pages.push(totalPages);
    }

    return pages;
  };

  const handleApplyFilters = () => {
    fetchNotifications(1);
    setShowMobileFilters(false);
  };

  const handleResetFilters = () => {
    setSearchText("");
    setSelectedChannel("");
    setSelectedStatus("");
    setDateFrom("");
    setDateTo("");
    fetchNotifications(1);
  };

  const refreshData = () => {
    fetchNotifications(currentPage);
  };

  const handleViewDetails = (notification: Notification) => {
    setNotificationDetails(notification);
    setShowDetailsModal(true);
  };

  const handleDeleteClick = (notification: Notification) => {
    setNotificationToDelete(notification);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!notificationToDelete) return;

    setIsDeleting(true);
    setDeletingId(notificationToDelete._id);

    try {
      const response = await fetch(`/api/notifications/history/${notificationToDelete._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      fetchNotifications(currentPage);
      setDeleteConfirmOpen(false);
      setNotificationToDelete(null);
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Failed to delete the notification. Please try again.");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setNotificationToDelete(null);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const bgColor =
      status === "Delivered"
        ? "bg-green-500/20 text-green-500"
        : status === "Pending" || status === "Scheduled"
        ? "bg-amber-500/20 text-amber-500"
        : status === "Failed"
        ? "bg-red-500/20 text-red-500"
        : status === "Sending"
        ? "bg-blue-500/20 text-blue-500"
        : "bg-gray-500/20 text-gray-500";

    const icon =
      status === "Delivered" ? (
        <CheckCircle className="h-3 w-3 mr-1" />
      ) : status === "Pending" || status === "Scheduled" ? (
        <Clock className="h-3 w-3 mr-1" />
      ) : status === "Failed" ? (
        <XCircle className="h-3 w-3 mr-1" />
      ) : status === "Sending" ? (
        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
      ) : (
        <AlertCircle className="h-3 w-3 mr-1" />
      );

    return (
      <span
        className={`px-2 py-1 rounded-full ${bgColor} flex items-center justify-center w-fit text-xs font-medium`}
      >
        {icon} {status}
      </span>
    );
  };

  const ChannelBadge = ({ channel }: { channel: string }) => {
    const bgColor =
      channel === "push"
        ? "bg-purple-500/20 text-purple-500"
        : channel === "whatsapp"
        ? "bg-green-500/20 text-green-500"
        : channel === "email"
        ? "bg-blue-500/20 text-blue-500"
        : "bg-blue-500/20 text-blue-500";

    const icon =
      channel === "push" ? (
        <Bell className="h-3 w-3 mr-1" />
      ) : channel === "whatsapp" ? (
        <MessageSquare className="h-3 w-3 mr-1" />
      ) : channel === "email" ? (
        <Mail className="h-3 w-3 mr-1" />
      ) : (
        <AlertCircle className="h-3 w-3 mr-1" />
      );

    return (
      <span
        className={`px-2 py-1 rounded-full ${bgColor} flex items-center justify-center w-fit text-xs font-medium`}
      >
        {icon}{" "}
        {channel === "push"
          ? "Push"
          : channel === "whatsapp"
          ? "WhatsApp"
          : channel === "email"
          ? "Email"
          : channel}
      </span>
    );
  };

  const GroupBadge = ({ group }: { group: string }) => {
    const bgColor = "bg-indigo-500/20 text-indigo-500";
    let label = group;

    if (group === "all") {
      label = "All Users";
    } else if (group === "subscribers") {
      label = "Subscribers";
    } else if (group === "boxholders") {
      label = "Box Holders";
    } else if (group === "custom") {
      label = "Custom";
    }

    return (
      <span className={`px-2 py-1 rounded-full ${bgColor} text-xs font-medium`}>{label}</span>
    );
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "push":
        return <Bell className="h-5 w-5 text-purple-500 dark:text-purple-400" />;
      case "whatsapp":
        return <MessageSquare className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case "email":
        return <Mail className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatUserGroup = (group: string): string => {
    switch (group) {
      case "all":
        return "All App Users";
      case "subscribers":
        return "Subscribers";
      case "boxholders":
        return "Box Holders";
      case "custom":
        return "Custom Selection";
      default:
        return group;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">
            Notification History
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track and manage sent notifications
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Link
            href="/admin/notifications/send-notifications"
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center"
          >
            <Send className="h-4 w-4 mr-2" /> Send Notification
          </Link>
          <button
            className="px-3 py-2 bg-white/10 text-black dark:text-white backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
            onClick={refreshData}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            className="px-3 py-2 bg-white/10 text-black dark:text-white dark:border-white/20 border-gray-600/20 backdrop-blur-md rounded-lg border text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center sm:hidden"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <Sliders className="h-4 w-4 mr-2" /> Filters
          </button>
        </div>
      </div>

      <div className="bg-transparent md:bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-none md:border-white/20 shadow-xl">
        <div className="hidden md:flex flex-col md:flex-row items-start md:items-end gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or content..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Channel
            </label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
            >
              <option className="text-black" value="">
                All Channels
              </option>
              <option className="text-black" value="push">
                Push
              </option>
              <option className="text-black" value="whatsapp">
                WhatsApp
              </option>
              <option className="text-black" value="email">
                Email
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
            >
              <option className="text-black" value="">
                All Statuses
              </option>
              <option className="text-black" value="Delivered">
                Delivered
              </option>
              <option className="text-black" value="Pending">
                Pending
              </option>
              <option className="text-black" value="Sending">
                Sending
              </option>
              <option className="text-black" value="Failed">
                Failed
              </option>
              <option className="text-black" value="Scheduled">
                Scheduled
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              To Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="px-4 py-2 h-10 bg-white/10 text-gray-700 dark:text-gray-300 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
              onClick={handleApplyFilters}
            >
              <Filter className="h-4 w-4 mr-2" /> Apply
            </button>

            <button
              className="px-4 py-2 h-10 bg-white/10 text-gray-700 dark:text-gray-300 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
              onClick={handleResetFilters}
            >
              <X className="h-4 w-4 mr-2" /> Reset
            </button>
          </div>
        </div>

        <div className="md:hidden mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
            />
          </div>
        </div>

        {showMobileFilters && (
          <div className="md:hidden bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-xl p-4 mb-4 border border-white/30 animate-fadeIn">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-800 dark:text-white">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Channel
                </label>
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                >
                  <option value="">All Channels</option>
                  <option value="push">Push</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                >
                  <option value="">All Statuses</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Pending">Pending</option>
                  <option value="Sending">Sending</option>
                  <option value="Failed">Failed</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300"
                >
                  Apply Filters
                </button>

                <button
                  onClick={handleResetFilters}
                  className="flex-1 px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {(selectedChannel || selectedStatus || dateFrom || dateTo) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedChannel && (
              <div className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 text-xs">
                Channel:{" "}
                {selectedChannel === "push"
                  ? "Push"
                  : selectedChannel === "whatsapp"
                  ? "WhatsApp"
                  : "Email"}
                <button
                  onClick={() => {
                    setSelectedChannel("");
                    fetchNotifications(1);
                  }}
                  className="ml-1 hover:text-purple-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {selectedStatus && (
              <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs">
                Status: {selectedStatus}
                <button
                  onClick={() => {
                    setSelectedStatus("");
                    fetchNotifications(1);
                  }}
                  className="ml-1 hover:text-green-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {dateFrom && (
              <div className="inline-flex items-center px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs">
                From: {new Date(dateFrom).toLocaleDateString()}
                <button
                  onClick={() => {
                    setDateFrom("");
                    fetchNotifications(1);
                  }}
                  className="ml-1 hover:text-amber-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {dateTo && (
              <div className="inline-flex items-center px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs">
                To: {new Date(dateTo).toLocaleDateString()}
                <button
                  onClick={() => {
                    setDateTo("");
                    fetchNotifications(1);
                  }}
                  className="ml-1 hover:text-amber-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            <button
              onClick={handleResetFilters}
              className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="relative w-12 h-12">
              <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
              <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-emerald-500 animate-spin"></div>
            </div>
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6">
              <Bell className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No notifications found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300"
            >
              Reset Filters
            </button>
          </div>
        )}

        {!isLoading && notifications.length > 0 && (
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="hidden md:table w-full text-left border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="sticky top-0 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-md p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-tl-lg">
                    Channel
                  </th>
                  <th className="sticky top-0 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-md p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div
                      className="flex items-center cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                      onClick={() => toggleSort("title")}
                    >
                      Title/Content
                      <ArrowUpDown
                        className={`ml-1 h-4 w-4 ${sortBy === "title" ? "text-emerald-500" : ""}`}
                      />
                    </div>
                  </th>
                  <th className="sticky top-0 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-md p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="sticky top-0 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-md p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="sticky top-0 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-md p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div
                      className="flex items-center cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                      onClick={() => toggleSort("sentAt")}
                    >
                      Date Sent
                      <ArrowUpDown
                        className={`ml-1 h-4 w-4 ${sortBy === "sentAt" ? "text-emerald-500" : ""}`}
                      />
                    </div>
                  </th>
                  <th className="sticky top-0 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-md p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-tr-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification, index) => (
                  <tr
                    key={notification._id}
                    className={`hover:bg-white/5 dark:hover:bg-gray-800/50 backdrop-blur-md transition-all group ${
                      index % 2 === 0 ? "bg-white/2" : "bg-white/5 dark:bg-gray-800/20"
                    }`}
                  >
                    <td className="p-3 text-sm border-b border-white/10">
                      <ChannelBadge channel={notification.channel} />
                    </td>
                    <td className="p-3 border-b border-white/10">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {notification.title ||
                          (notification.subject && `Subject: ${notification.subject}`) ||
                          "No Title"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                        {notification.body}
                      </div>
                    </td>
                    <td className="p-3 border-b border-white/10">
                      <GroupBadge group={notification.userGroup} />
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {notification.sentCount > 0
                          ? `${notification.deliveredCount}/${notification.sentCount} delivered`
                          : "N/A"}
                      </div>
                    </td>
                    <td className="p-3 border-b border-white/10">
                      <StatusBadge status={notification.status} />
                    </td>
                    <td className="p-3 text-sm text-gray-500 dark:text-gray-400 border-b border-white/10">
                      {notification.displayDate}
                    </td>
                    <td className="p-3 border-b border-white/10">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(notification)}
                          className="p-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(notification)}
                          className="p-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
                          disabled={isDeleting && deletingId === notification._id}
                        >
                          <Trash2
                            className={`h-4 w-4 ${
                              isDeleting && deletingId === notification._id ? "animate-pulse" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="md:hidden space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="p-4 bg-white/5 dark:bg-gray-800/20 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <ChannelBadge channel={notification.channel} />
                    <StatusBadge status={notification.status} />
                  </div>

                  <div className="mt-2">
                    <div className="text-sm font-medium text-gray-800 dark:text-white mb-1">
                      {notification.title ||
                        (notification.subject && `Subject: ${notification.subject}`) ||
                        "No Title"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {notification.body}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <GroupBadge group={notification.userGroup} />
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {notification.displayDate}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => handleViewDetails(notification)}
                      className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(notification)}
                      className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
                      disabled={isDeleting && deletingId === notification._id}
                    >
                      <Trash2
                        className={`h-4 w-4 ${
                          isDeleting && deletingId === notification._id ? "animate-pulse" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && totalItems > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span>{" "}
              of <span className="font-medium">{totalItems}</span> notifications
            </div>
            <div className="flex items-center space-x-1 order-1 sm:order-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                    : "bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {getPageNumbers().map((page, index) =>
                page === "ellipsis1" || page === "ellipsis2" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-3 py-1 text-gray-500 dark:text-gray-400"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={`page-${page}`}
                    onClick={() => handlePageChange(page as number)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                      currentPage === page
                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                        : "bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                    : "bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20"
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showDetailsModal && notificationDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                {getChannelIcon(notificationDetails.channel)}
                <span className="ml-2">Notification Details</span>
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </h4>
                  <StatusBadge status={notificationDetails.status} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Channel
                  </h4>
                  <ChannelBadge channel={notificationDetails.channel} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Recipients
                  </h4>
                  <div>
                    <GroupBadge group={notificationDetails.userGroup} />
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {formatUserGroup(notificationDetails.userGroup)}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Date Sent
                  </h4>
                  <p className="text-sm text-gray-800 dark:text-white">
                    {notificationDetails.displayDate}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {notificationDetails.channel === "email" ? "Subject" : "Title"}
                </h4>
                <p className="text-base font-medium text-gray-800 dark:text-white">
                  {notificationDetails.title || notificationDetails.subject || "No Title"}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Content
                </h4>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700 whitespace-pre-line">
                  <p className="text-sm text-gray-800 dark:text-white">{notificationDetails.body}</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Delivery Statistics
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Sent</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {notificationDetails.sentCount}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Delivered</div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {notificationDetails.deliveredCount}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Failed</div>
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">
                      {notificationDetails.failedCount}
                    </div>
                  </div>
                </div>
              </div>

              {notificationDetails.scheduledFor && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Scheduled For
                  </h4>
                  <p className="text-sm text-gray-800 dark:text-white">
                    {new Date(notificationDetails.scheduledFor).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleDeleteClick(notificationDetails);
                }}
                className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800/50 transition-all duration-300 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmOpen && notificationToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Confirm Deletion
            </h3>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete this notification?
              <br />
              <br />
              <span className="text-red-600 dark:text-red-400 text-sm">
                This action cannot be undone.
              </span>
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all duration-300 flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}