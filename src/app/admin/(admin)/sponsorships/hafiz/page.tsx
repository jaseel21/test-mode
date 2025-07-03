"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  Book,
  Calendar,
  SlidersHorizontal,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import AdminHeader from "@/components/admin-section/sponsorship/AdminHeader";
import SponsorshipTable from "@/components/admin-section/sponsorship/SponsorshipTable";
import SponsorshipForm from "@/components/admin-section/sponsorship/SponsorshipForm";
import DeleteConfirmModal from "@/components/admin-section/sponsorship/DeleteConfirmModal";
import { Sponsorship } from "@/app/admin/(admin)/sponsorships/list/page";

// Define stats interface
interface HafizStats {
  totalSponsors: number;
  totalAmount: number;
  monthlySponsors: number;
  yearlySponsors: number;
  quarterlySponsors: number;
}

export default function HafizSponsorshipPage() {
  // State for sponsorship data
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [filteredSponsorships, setFilteredSponsorships] = useState<Sponsorship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<HafizStats>({
    totalSponsors: 0,
    totalAmount: 0,
    monthlySponsors: 0,
    yearlySponsors: 0,
    quarterlySponsors: 0,
  });

  // State for filtering and sorting
  const [searchText, setSearchText] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);

  // State for CRUD operations
  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [selectedSponsorship, setSelectedSponsorship] = useState<Sponsorship | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sponsorToDelete, setSponsorToDelete] = useState<Sponsorship | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch sponsorships from API
  useEffect(() => {
    fetchSponsorships();
  }, []);

  // Memoized applyFilters function
  const applyFilters = useCallback(() => {
    let filtered = [...sponsorships];

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.razorpayOrderId.toLowerCase().includes(searchLower) ||
          s.district.toLowerCase().includes(searchLower)
      );
    }

    // Apply period filter
    if (selectedPeriod) {
      filtered = filtered.filter((s) => s.period === selectedPeriod);
    }

    // Apply date filters
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter((s) => new Date(s.createdAt) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((s) => new Date(s.createdAt) <= toDate);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "createdAt") {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }

      if (sortBy === "amount") {
        return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
      }

      const valueA = String(a[sortBy as keyof Sponsorship] || "");
      const valueB = String(b[sortBy as keyof Sponsorship] || "");
      return sortOrder === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });

    setFilteredSponsorships(filtered);
    setCurrentPage(1);
  }, [searchText, selectedPeriod, dateFrom, dateTo, sortBy, sortOrder, sponsorships]);

  // Run applyFilters when filter/sort states change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Memoized calculateStats function
  const calculateStats = useCallback(() => {
    const monthlySponsors = sponsorships.filter((s) => s.period === "1 Month" || s.period === "1 Month(with education)").length;
    const quarterlySponsors = sponsorships.filter((s) => s.period === "6 Months" || s.period === "6 Months(with education)").length;
    const yearlySponsors = sponsorships.filter((s) => s.period === "One Year" || s.period === "One Year(with education)").length;
    const totalAmount = sponsorships.reduce((sum, sponsor) => sum + sponsor.amount, 0);

    setStats({
      totalSponsors: sponsorships.length,
      totalAmount,
      monthlySponsors,
      yearlySponsors,
      quarterlySponsors,
    });
  }, [sponsorships]);

  // Update total pages when filteredSponsorships changes
  useEffect(() => {
    setTotalPages(Math.ceil(filteredSponsorships.length / itemsPerPage));
  }, [filteredSponsorships]);

  // Calculate stats when sponsorships change
  useEffect(() => {
    if (sponsorships.length > 0) {
      calculateStats();
    }
  }, [sponsorships, calculateStats]);

  const fetchSponsorships = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/sponsorships?type=Sponsor-Hafiz", {
        headers: {
          "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch sponsorships");
      }

      const data = await response.json();
      setSponsorships(data);
      setFilteredSponsorships(data);
    } catch (error) {
      console.error("Error fetching sponsorships:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSponsor = () => {
    setSelectedSponsorship(null);
    setFormMode("add");
  };

  const handleEditSponsor = (sponsorship: Sponsorship) => {
    setSelectedSponsorship(sponsorship);
    setFormMode("edit");
  };

  const handleDeleteClick = (sponsorship: Sponsorship) => {
    setSponsorToDelete(sponsorship);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sponsorToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/sponsorships/${sponsorToDelete._id}`, {
        method: "DELETE",
        headers: {
          "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete sponsorship");
      }

      setSponsorships(sponsorships.filter((s) => s._id !== sponsorToDelete._id));
      setShowDeleteConfirm(false);
      setSponsorToDelete(null);
    } catch (error) {
      console.error("Error deleting sponsorship:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormClose = () => {
    setFormMode(null);
  };

  const handleFormSubmit = async (sponsorData: Partial<Sponsorship>) => {
    try {
      // Ensure type is set to Hafiz
      sponsorData.type = "Sponsor-Hafiz";

      if (formMode === "add") {
        const response = await fetch("/api/admin/sponsorships", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
          },
          body: JSON.stringify(sponsorData),
        });

        if (!response.ok) {
          throw new Error("Failed to add sponsorship");
        }

        const newSponsor = await response.json();
        setSponsorships([...sponsorships, newSponsor]);
      } else if (formMode === "edit" && selectedSponsorship) {
        const response = await fetch(`/api/admin/sponsorships/${selectedSponsorship._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
          },
          body: JSON.stringify(sponsorData),
        });

        if (!response.ok) {
          throw new Error("Failed to update sponsorship");
        }

        const updatedSponsor = await response.json();
        setSponsorships(
          sponsorships.map((s) => (s._id === updatedSponsor._id ? updatedSponsor : s))
        );
      }

      setFormMode(null);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleResetFilters = () => {
    setSearchText("");
    setSelectedPeriod("");
    setDateFrom("");
    setDateTo("");
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getCurrentPageItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSponsorships.slice(startIndex, endIndex);
  }, [filteredSponsorships, currentPage]);

  const getPageNumbers = useMemo((): (number | string)[] => {
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
  }, [totalPages, currentPage]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/admin/sponsorships"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to All Sponsorships
        </Link>
      </div>

      {/* Header component */}
      <AdminHeader
        title="Hafiz Sponsorship Management"
        description="Manage Hafiz program sponsorships and track contributions"
        onAddNew={handleAddSponsor}
      />

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sponsors</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  stats.totalSponsors
                )}
              </h3>
            </div>
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
              <Book className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {isLoading ? (
                  <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  formatCurrency(stats.totalAmount)
                )}
              </h3>
            </div>
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
              <Book className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">One Month</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  stats.monthlySponsors
                )}
              </h3>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Six Months</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  stats.quarterlySponsors
                )}
              </h3>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">One Year</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  stats.yearlySponsors
                )}
              </h3>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content section */}
      <div className="bg-transparent md:bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-none md:border-white/20 shadow-xl">
        {/* Desktop filters */}
        <div className="hidden md:flex flex-col md:flex-row items-start md:items-end gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
            >
              <option value="">All Periods</option>
              <option value="One Year">One Year</option>
              <option value="One Year(with education)">One Year + Edu</option>
              <option value="6 Months">6 Months</option>
              <option value="6 Months(with education)">6 Months + Edu</option>
              <option value="1 Month">1 Month</option>
              <option value="1 Month(with education)">1 Month + Edu</option>
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
                className="pl-10 pr-4 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
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
                className="pl-10 pr-4 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="px-4 py-2 h-10 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
              onClick={applyFilters}
            >
              <Filter className="h-4 w-4 mr-2" /> Apply
            </button>

            <button
              className="px-4 py-2 h-10 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
              onClick={handleResetFilters}
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Mobile search and filter toggle */}
        <div className="md:hidden mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
            />
          </div>
          <button
            className="mt-2 w-full px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {showMobileFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* Mobile filters panel */}
        {showMobileFilters && (
          <div className="md:hidden bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-xl p-4 mb-4 border border-white/30 animate-fadeIn">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Period
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                >
                  <option value="">All Periods</option>
                  <option value="One Year">One Year</option>
                  <option value="One Year(with education)">One Year + Edu</option>
                  <option value="6 Months">6 Months</option>
                  <option value="6 Months(with education)">6 Months + Edu</option>
                  <option value="1 Month">1 Month</option>
                  <option value="1 Month(with education)">1 Month + Edu</option>
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
                  onClick={applyFilters}
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

        {/* Table component */}
        <SponsorshipTable
          sponsorships={getCurrentPageItems}
          isLoading={isLoading}
          onEdit={handleEditSponsor}
          onDelete={handleDeleteClick}
          toggleSort={toggleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onViewDetails={() => {}}
        />

        {/* Pagination */}
        {!isLoading && filteredSponsorships.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredSponsorships.length)}
              </span>{" "}
              of <span className="font-medium">{filteredSponsorships.length}</span> entries
            </div>
            {totalPages > 1 && (
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
                  Previous
                </button>

                {getPageNumbers.map((page, index) =>
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
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form modal for Add/Edit */}
      {formMode && (
        <SponsorshipForm
          mode={formMode}
          sponsorship={selectedSponsorship}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        isDeleting={isDeleting}
        sponsorship={sponsorToDelete}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}