"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Box, Calendar, AlertCircle, RefreshCcw, ChevronLeft, ChevronRight,
  Search, Download, BarChart2,
} from "lucide-react";

export default function TrackPaymentsPage() {
  const { boxId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "descending" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch donations data
  useEffect(() => {
    const fetchDonations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/donations/admin/box/${boxId}`,{
          method: 'GET',
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch donations (Status: ${response.status})`);
        }
        const data = await response.json();
        setDonations(data);
        setFilteredDonations(data);
      } catch (error) {
        console.error("Error loading donations:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDonations();
  }, [boxId]);

  // Handle search, filter, and sort
  useEffect(() => {
    let results = donations;

    // Search filter
    if (searchTerm) {
      results = results.filter((donation) =>
        [donation.name, donation.phone].some((field) =>
          field?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      results = results.filter((donation) => donation.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      results = results.filter((donation) => donation.status === statusFilter);
    }

    // Sorting
    results = [...results].sort((a, b) => {
      const aValue = a[sortConfig.key] ?? "";
      const bValue = b[sortConfig.key] ?? "";
      if (aValue === bValue) return 0;
      const direction = sortConfig.direction === "ascending" ? 1 : -1;
      if (sortConfig.key === "createdAt") {
        return (new Date(aValue) - new Date(bValue)) * direction;
      }
      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * direction;
      }
      return (aValue < bValue ? -1 : 1) * direction;
    });

    setFilteredDonations(results);
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter, sortConfig, donations]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDonations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);

  // Sorting handlers
  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "ascending" ? "descending" : "ascending",
    }));
  };
  const getSortIndicator = (key) => (sortConfig.key === key ? (sortConfig.direction === "ascending" ? "↑" : "↓") : null);

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Donation ID", "Amount", "Type", "Status", "Date", "Name", "Phone", "District", "Panchayat",
    ];
    const csvData = filteredDonations.map((donation) => [
      donation._id,
      donation.amount,
      donation.type,
      donation.status,
      new Date(donation.createdAt).toLocaleDateString(),
      donation.name || "Anonymous",
      donation.phone || "N/A",
      donation.district || "N/A",
      donation.panchayat || "N/A",
    ]);
    const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `donations_box_${boxId}.csv`;
    link.click();
  };

  // Calculate total amount
  const totalAmount = filteredDonations.reduce((sum, donation) => sum + donation.amount, 0);

  // Client-side date formatting
  const formatDate = (date) => (typeof window !== "undefined" ? new Date(date).toLocaleDateString() : date);

  // Loading and Error States
  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="relative w-12 h-12 animate-spin">
        <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500" />
      </div>
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Error</h2>
      <p className="text-gray-500 dark:text-gray-400">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center"
      >
        <RefreshCcw className="h-4 w-4 mr-2" /> Retry
      </button>
    </div>
  );

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center">
            <Box className="mr-3 h-6 w-6 text-emerald-500" /> Payment Tracking for Box ID: {boxId}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and manage donations for this box</p>
        </div>
        <Link
          href="/admin/boxes"
          className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Boxes
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700 flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Donations</p>
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">{filteredDonations.length}</h3>
          </div>
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart2 className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700 flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">₹{totalAmount.toLocaleString()}</h3>
          </div>
          <div className="p-2 bg-green-100 rounded-lg">
            <Box className="h-5 w-5 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700 flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Completed Donations</p>
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
              {filteredDonations.filter((d) => d.status === "Completed").length}
            </h3>
          </div>
          <div className="p-2 bg-purple-100 rounded-lg">
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-grow md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              className="pl-10 pr-4 py-2 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-700 dark:text-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-700 dark:text-gray-300"
            >
              <option value="all">All Types</option>
              {["General", "Yatheem", "Hafiz", "Building", "Campaign", "Institution", "Box", "Sponsor-Yatheem", "Sponsor-Hafiz"].map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-700 dark:text-gray-300"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
            >
              <Download className="h-4 w-4 mr-2" /> Export
            </button>
          </div>
        </div>

        {/* Donations Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {[
                  { key: "_id", label: "Donation ID" },
                  { key: "amount", label: "Amount" },
                  { key: "type", label: "Type" },
                  { key: "status", label: "Status" },
                  { key: "createdAt", label: "Date" },
                  { key: "name", label: "Name" },
                  { key: "phone", label: "Phone" },
                  { key: "district", label: "District" },
                  { key: "panchayat", label: "Panchayat" },
                ].map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort(col.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{col.label}</span>
                      <span>{getSortIndicator(col.key)}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {currentItems.length ? (
                currentItems.map((donation) => (
                  <tr key={donation._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{donation._id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">₹{donation.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{donation.type}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          donation.status === "Completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                      {formatDate(donation.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{donation.name || "Anonymous"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{donation.phone || "N/A"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{donation.district || "N/A"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{donation.panchayat || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    No donations found for this box.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredDonations.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${currentPage === 1 ? "text-gray-300" : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-md ${currentPage === pageNum ? "bg-emerald-500 text-white" : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${currentPage === totalPages ? "text-gray-300" : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
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