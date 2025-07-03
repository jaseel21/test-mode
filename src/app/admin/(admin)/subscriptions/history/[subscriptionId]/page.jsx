"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Clock, Download, ChevronLeft, ChevronRight, AlertCircle, RefreshCcw,
  Calendar, BarChart2, TrendingUp,
} from "lucide-react";

export default function SubscriptionHistoryPage() {
  const { subscriptionId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [donations, setDonations] = useState([]);
  const [logs, setLogs] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "descending" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [detailsResponse, logsResponse] = await Promise.all([
          fetch(`/api/subscriptions/details?subscriptionId=${subscriptionId}`,{
            headers: {
              'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
            },
          }),
          fetch(`/api/subscriptions/logs/${subscriptionId}`,{
            headers: {
              'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
            }
          }),
        ]);

        if (!detailsResponse.ok) throw new Error("Failed to fetch subscription details");
        if (!logsResponse.ok) throw new Error("Failed to fetch logs");

        const detailsData = await detailsResponse.json();
        const logsData = await logsResponse.json();

        setSubscription(detailsData.subscription);
        setDonations(detailsData.donations);
        setFilteredDonations(detailsData.donations);
        setLogs(logsData);
      } catch (error) {
        console.error("Error loading history:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (subscriptionId) fetchHistory();
  }, [subscriptionId]);

  useEffect(() => {
    let results = [...donations];

    // Apply date range filter
    if (dateRange.start || dateRange.end) {
      results = results.filter((donation) => {
        const date = new Date(donation.createdAt);
        const start = dateRange.start ? new Date(dateRange.start) : null;
        const end = dateRange.end ? new Date(dateRange.end) : null;
        return (!start || date >= start) && (!end || date <= end);
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      results = results.filter((donation) => donation.paymentStatus === statusFilter);
    }

    // Apply method filter
    if (methodFilter !== "all") {
      results = results.filter((donation) => donation.method === methodFilter);
    }

    // Apply sorting
    results.sort((a, b) => {
      const aValue = a[sortConfig.key] ?? "";
      const bValue = b[sortConfig.key] ?? "";
      if (aValue === bValue) return 0;
      const direction = sortConfig.direction === "ascending" ? 1 : -1;
      if (sortConfig.key === "createdAt") return (new Date(aValue) - new Date(bValue)) * direction;
      if (typeof aValue === "number") return (aValue - bValue) * direction;
      return aValue.toString().localeCompare(bValue.toString()) * direction;
    });

    setFilteredDonations(results);
    setCurrentPage(1);
  }, [donations, dateRange, statusFilter, methodFilter, sortConfig]);

  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "ascending" ? "descending" : "ascending",
    }));
  };

  const getSortIndicator = (key) => (sortConfig.key === key ? (sortConfig.direction === "ascending" ? "↑" : "↓") : "");

  const exportToCSV = (type) => {
    if (type === "donations") {
      const headers = ["ID", "Amount", "Type", "Method", "Status", "Date"];
      const csvData = filteredDonations.map((donation) => [
        donation._id,
        donation.amount || 0,
        donation.type || "N/A",
        donation.method || "N/A",
        donation.paymentStatus || "N/A",
        donation.createdAt ? formatDate(donation.createdAt) : "N/A",
      ]);
      const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n");
      downloadCSV(csvContent, "subscription_payment_history.csv");
    } else if (type === "logs") {
      const headers = ["Action", "Details", "Timestamp"];
      const csvData = logs.map((log) => [
        log.action || "N/A",
        log.details ? JSON.stringify(log.details) : "N/A",
        log.timestamp ? formatDate(log.timestamp) : "N/A",
      ]);
      const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n");
      downloadCSV(csvContent, "subscription_action_logs.csv");
    }
  };

  const downloadCSV = (content, fileName) => {
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    return typeof window !== "undefined"
      ? new Date(dateString).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
      : dateString;
  };

  const totalPaid = filteredDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const successRate = donations.length ? (donations.filter((d) => d.paymentStatus === "paid").length / donations.length * 100).toFixed(1) : 0;
  const avgPayment = donations.length ? (totalPaid / donations.length).toFixed(2) : 0;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDonations = filteredDonations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-t-emerald-500 rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded flex items-center">
          <RefreshCcw className="h-4 w-4 mr-2" /> Retry
        </button>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex justify-center items-center h-screen">
        No subscription history found
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border">
        <div className="flex items-center space-x-4">
          <BarChart2 className="h-6 w-6 text-emerald-500" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Subscription History</h2>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mt-1">
              <p><strong>Subscription ID:</strong> {subscription._id}</p>
              {subscription.planId && <p><strong>Plan ID:</strong> {subscription.planId}</p>}
              <p><strong>Name:</strong> {subscription.name || "N/A"}</p>
              <p><strong>Period:</strong> {subscription.period || "N/A"}</p>
              <p><strong>Payment Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${subscription.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                  {subscription.paymentStatus || "N/A"}
                </span>
              </p>
            </div>
          </div>
        </div>
        <Link href={`/admin/subscriptions/details?donorId=${subscription.donorId}&subscriptionId=${subscriptionId}`} className="mt-4 md:mt-0 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border hover:bg-gray-100 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Details
        </Link>
      </div>

      {/* Analytics Dashboard */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-emerald-500" /> Analytics Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <label className="text-sm font-medium">Total Paid</label>
            <p className="text-xl font-semibold">₹{totalPaid.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <label className="text-sm font-medium">Average Payment</label>
            <p className="text-xl font-semibold">₹{avgPayment}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <label className="text-sm font-medium">Payment Count</label>
            <p className="text-xl font-semibold">{donations.length}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <label className="text-sm font-medium">Success Rate</label>
            <p className="text-xl font-semibold">{successRate}%</p>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Payment History</h3>
          <button onClick={() => exportToCSV("donations")} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center">
            <Download className="h-4 w-4 mr-2" /> Export
          </button>
        </div>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className="p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className="p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            <option value="all">All Methods</option>
            <option value="auto">Auto</option>
            <option value="manual">Manual</option>
          </select>
        </div>
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {[
                  { key: "_id", label: "ID" },
                  { key: "amount", label: "Amount" },
                  { key: "type", label: "Type" },
                  { key: "method", label: "Method" },
                  { key: "paymentStatus", label: "Status" },
                  { key: "createdAt", label: "Date" },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => requestSort(col.key)}
                    className="px-4 py-3 text-left text-xs font-medium uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    {col.label} {getSortIndicator(col.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {currentDonations.map((donation) => (
                <tr key={donation._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 text-sm">{donation._id}</td>
                  <td className="px-4 py-3 text-sm">₹{(donation.amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">{donation.type || "N/A"}</td>
                  <td className="px-4 py-3 text-sm">{donation.method || "N/A"}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${donation.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {donation.paymentStatus || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{donation.createdAt ? formatDate(donation.createdAt) : "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredDonations.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex space-x-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg disabled:text-gray-300 hover:bg-gray-100">
                <ChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded ${currentPage === pageNum ? "bg-emerald-500 text-white" : "hover:bg-gray-100"}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg disabled:text-gray-300 hover:bg-gray-100">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Logs Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <Clock className="h-5 w-5 mr-2 text-emerald-500" /> Action Logs
          </h3>
          <button onClick={() => exportToCSV("logs")} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center">
            <Download className="h-4 w-4 mr-2" /> Export
          </button>
        </div>
        <div className="space-y-6">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-emerald-500 before:rounded">
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mt-1.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{log.action || "N/A"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{log.timestamp ? formatDate(log.timestamp) : "N/A"}</p>
                    {log.details && (
                      <pre className="mt-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No action logs available.</p>
          )}
        </div>
      </div>
    </div>
  );
}