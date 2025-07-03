"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, User, AlertCircle, RefreshCcw, ChevronLeft, ChevronRight,
  Search, Download, Eye, BarChart2,
} from "lucide-react";

// Helper function to determine payment status
function getPaymentStatus(period, lastPaymentAt) {
  const now = new Date();
  const lastPaymentDate = new Date(lastPaymentAt);

  if (isNaN(lastPaymentDate.getTime())) return "pending";

  switch (period) {
    case "daily":
      return now.toDateString() === lastPaymentDate.toDateString() ? "paid" : "pending";
    case "weekly":
      const getWeekStart = (date) => {
        const d = new Date(date);
        d.setDate(d.getDate() - d.getDay());
        d.setHours(0, 0, 0, 0);
        return d;
      };
      return getWeekStart(now).getTime() === getWeekStart(lastPaymentDate).getTime() ? "paid" : "pending";
    case "monthly":
      return now.getMonth() === lastPaymentDate.getMonth() && now.getFullYear() === lastPaymentDate.getFullYear() ? "paid" : "pending";
    case "yearly":
      return now.getFullYear() === lastPaymentDate.getFullYear() ? "paid" : "pending";
    default:
      return "pending";
  }
}

export default function ManualSubscriptionsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all"); // Updated to payment status
  const [periodFilter, setPeriodFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "descending" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/subscriptions/manual",{
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch manual subscriptions");
        const data = await response.json();
        // Add paymentStatus to each subscription
        const enrichedData = data.map((sub) => ({
          ...sub,
          paymentStatus: getPaymentStatus(sub.period, sub.lastPaymentAt),
        }));
        setSubscriptions(enrichedData);
        setFilteredSubscriptions(enrichedData);
      } catch (error) {
        console.error("Error loading manual subscriptions:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    let results = subscriptions;

    if (searchTerm) {
      results = results.filter((sub) =>
        [sub.name, sub.phone].some((field) =>
          field?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (paymentStatusFilter !== "all") {
      results = results.filter((sub) => sub.paymentStatus === paymentStatusFilter);
    }

    if (periodFilter !== "all") {
      results = results.filter((sub) => sub.period === periodFilter);
    }

    results = [...results].sort((a, b) => {
      const aValue = a[sortConfig.key] ?? "";
      const bValue = b[sortConfig.key] ?? "";
      if (aValue === bValue) return 0;
      const direction = sortConfig.direction === "ascending" ? 1 : -1;
      if (sortConfig.key === "createdAt" || sortConfig.key === "lastPaymentAt") {
        return (new Date(aValue) - new Date(bValue)) * direction;
      }
      if (typeof aValue === "string") return aValue.localeCompare(bValue) * direction;
      return (aValue < bValue ? -1 : 1) * direction;
    });

    setFilteredSubscriptions(results);
    setCurrentPage(1);
  }, [searchTerm, paymentStatusFilter, periodFilter, sortConfig, subscriptions]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSubscriptions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);

  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "ascending" ? "descending" : "ascending",
    }));
  };
  const getSortIndicator = (key) => (sortConfig.key === key ? (sortConfig.direction === "ascending" ? "↑" : "↓") : "");

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Phone", "Amount", "Period", "Payment Status", "Last Payment"];
    const csvData = filteredSubscriptions.map((sub) => [
      sub._id,
      sub.name,
      sub.phone,
      sub.amount,
      sub.period,
      sub.paymentStatus,
      new Date(sub.lastPaymentAt).toLocaleDateString(),
    ]);
    const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "manual_subscriptions.csv";
    link.click();
  };

  const formatDate = (date) => (typeof window !== "undefined" ? new Date(date).toLocaleDateString() : date);

  if (isLoading) return <div className="flex justify-center items-center min-h-screen bg-gray-50"><div className="animate-spin w-12 h-12 border-4 border-t-emerald-500 rounded-full" /></div>;
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded flex items-center">
        <RefreshCcw className="h-4 w-4 mr-2" /> Retry
      </button>
    </div>
  );

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center">
          <User className="mr-3 h-6 w-6 text-emerald-500" /> Manual Subscriptions
        </h2>
        <Link href="/admin/subscriptions" className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border hover:bg-gray-100 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" /> All Subscriptions
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-grow md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Payment Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Periods</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button onClick={exportToCSV} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center">
              <Download className="h-4 w-4 mr-2" /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {[
                  { key: "_id", label: "ID" },
                  { key: "name", label: "Name" },
                  { key: "phone", label: "Phone" },
                  { key: "amount", label: "Amount" },
                  { key: "period", label: "Period" },
                  { key: "paymentStatus", label: "Payment Status" }, // Updated to Payment Status
                  { key: "lastPaymentAt", label: "Last Payment" },
                  { key: null, label: "Actions" },
                ].map((col) => (
                  <th
                    key={col.key || col.label}
                    className="px-4 py-3 text-left text-xs font-medium uppercase cursor-pointer"
                    onClick={col.key ? () => requestSort(col.key) : undefined}
                  >
                    {col.label} {col.key && getSortIndicator(col.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {currentItems.map((sub) => (
                <tr key={sub._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 text-sm">{sub._id}</td>
                  <td className="px-4 py-3 text-sm">{sub.name}</td>
                  <td className="px-4 py-3 text-sm">{sub.phone}</td>
                  <td className="px-4 py-3 text-sm">₹{sub.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">{sub.period}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        sub.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {sub.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{formatDate(sub.lastPaymentAt)}</td>
                  <td className="px-4 py-3 text-sm flex space-x-3">
                    <Link href={`/admin/subscriptions/details?donorId=${sub.donorId}&subscriptionId=${sub._id}`} className="text-blue-600 hover:text-blue-800">
                      <Eye className="h-5 w-5" />
                    </Link>
                    <Link href={`/admin/subscriptions/history/${sub._id}`} className="text-purple-600 hover:text-purple-800">
                      <BarChart2 className="h-5 w-5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubscriptions.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg disabled:text-gray-300 hover:bg-gray-100"
              >
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
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg disabled:text-gray-300 hover:bg-gray-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}