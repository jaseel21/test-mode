"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReceiptCard from "./ReceiptCard";
import EmptyState from "./EmptyState";
import { generatePDF } from "@/lib/receipt-pdf";

const ReceiptList = ({ phoneNumber, onLogout }) => {
  const [receipts, setReceipts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalDonations, setTotalDonations] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState({
    date: "",
    type: "",
    status: "",
    minAmount: "",
    maxAmount: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, duration: 0.6 } },
  };

  const listItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12 } },
  };

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const fetchWithRetry = async (page) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/receipts?phone=${encodeURIComponent(phoneNumber)}&page=${page}&limit=${itemsPerPage}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch receipts: ${response.status} - ${errorText || "Unknown error"}`);
        }

        const data = await response.json();

        if (!isMounted) return;

        if (!Array.isArray(data.receipts) || data.receipts.length === 0) {
          toast.warn("No donations found for this number", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            toastId: "no-receipts",
          });
          setReceipts([]);
          setTotalAmount(0);
          setTotalDonations(0);
          setTotalPages(1);
        } else {
          setReceipts(data.receipts);
          setTotalAmount(data.totals.totalAmount || 0);
          setTotalDonations(data.totals.totalDonations || 0);
          setTotalPages(data.pagination?.totalPages || 1);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        if (isMounted && retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying fetch (${retryCount}/${maxRetries})...`);
          setTimeout(() => fetchWithRetry(page), 1000 * retryCount);
        } else if (isMounted) {
          const errorMessage = err.message || "Failed to load receipts. Please try again.";
          setError(errorMessage);
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            toastId: "fetch-error",
          });
          setReceipts([]);
          setTotalAmount(0);
          setTotalDonations(0);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (phoneNumber) {
      fetchWithRetry(currentPage);
    } else {
      console.warn("No phoneNumber provided, skipping fetch");
      setIsLoading(false);
      setError("Phone number missing. Please log in again.");
    }

    return () => {
      isMounted = false;
      console.log("Cleaning up useEffect for ReceiptList");
    };
  }, [phoneNumber, currentPage, itemsPerPage]);

  const handleDownload = async (receipt) => {
    try {
      // Ensure district is a string for generatePDF
      const receiptData = {
        ...receipt,
        district: receipt.district || "Unknown", // Fallback if district is undefined
      };
      await generatePDF(receiptData);
      toast.success("Receipt PDF generated successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } catch (err) {
      console.error("Error generating PDF:", err);
      const errorMessage = err.message || "Failed to generate receipt PDF. Please try again.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        toastId: "pdf-error",
      });
    }
  };

  const getFilteredByTab = (receipts) => {
    switch (activeTab) {
      case "completed":
        return receipts.filter((receipt) => receipt.status === "Completed");
      case "pending":
        return receipts.filter((receipt) => receipt.status === "Pending");
      default:
        return receipts;
    }
  };

  const getFilteredReceipts = () => {
    let filtered = [...receipts];
    filtered = getFilteredByTab(filtered);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (receipt) =>
          (receipt.type && receipt.type.toLowerCase().includes(query)) ||
          (receipt._id && receipt._id.toLowerCase().includes(query)) ||
          (receipt.razorpayOrderId && receipt.razorpayOrderId.toLowerCase().includes(query))
      );
    }

    if (filter.date) {
      filtered = filtered.filter((receipt) => {
        if (!receipt.createdAt) return false;
        const receiptDate = new Date(receipt.createdAt).toISOString().split("T")[0];
        return receiptDate === filter.date;
      });
    }

    if (filter.type) {
      filtered = filtered.filter(
        (receipt) => receipt.type && receipt.type.toLowerCase().includes(filter.type.toLowerCase())
      );
    }

    if (filter.status) {
      filtered = filtered.filter(
        (receipt) => receipt.status && receipt.status.toLowerCase() === filter.status.toLowerCase()
      );
    }

    if (filter.minAmount) {
      const minAmount = Number(filter.minAmount);
      if (!isNaN(minAmount)) {
        filtered = filtered.filter(
          (receipt) => typeof receipt.amount === "number" && receipt.amount >= minAmount
        );
      }
    }

    if (filter.maxAmount) {
      const maxAmount = Number(filter.maxAmount);
      if (!isNaN(maxAmount)) {
        filtered = filtered.filter(
          (receipt) => typeof receipt.amount === "number" && receipt.amount <= maxAmount
        );
      }
    }

    return filtered;
  };

  const handleFilterChange = (e) => {
    setFilter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleFilter = () => setIsFiltering(!isFiltering);

  const clearFilters = () => {
    setFilter({ date: "", type: "", status: "", minAmount: "", maxAmount: "" });
    setSearchQuery("");
  };

  const filteredReceipts = getFilteredReceipts();
  const donationTypes = ["General", ...new Set(receipts.map((receipt) => receipt.type || "General"))];

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  function fetchWithRetry(_currentPage) {
    console.log(_currentPage);
    throw new Error("Function not implemented.");
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <ToastContainer />
      <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md rounded-xl shadow-xl overflow-hidden mb-6 border border-gray-100 dark:border-gray-800">
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 py-6 px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Your Donation Receipts</h2>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                <p className="text-indigo-100 text-sm">Connected as +91 {phoneNumber}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <button
                onClick={() => fetchWithRetry(currentPage)}
                disabled={isLoading}
                className="text-white bg-indigo-700/50 backdrop-blur-sm hover:bg-indigo-700/70 px-4 py-2 rounded-lg text-sm font-medium flex items-center transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
              <button
                onClick={onLogout}
                className="text-white bg-indigo-700/50 backdrop-blur-sm hover:bg-indigo-700/70 px-4 py-2 rounded-lg text-sm font-medium flex items-center transform transition hover:scale-105"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-indigo-50/50 to-white/20 dark:from-gray-800/50 dark:to-gray-900/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg shadow-md backdrop-blur-sm border border-indigo-100 dark:border-gray-700"
            >
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Receipts</h3>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalDonations}</p>
            </motion.div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg shadow-md backdrop-blur-sm border border-purple-100 dark:border-gray-700"
            >
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                ₹{totalAmount.toLocaleString("en-IN")}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md mb-6"
            >
              <div className="flex">
                <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  <button
                    onClick={() => fetchWithRetry(currentPage)}
                    className="text-sm text-red-700 dark:text-red-300 font-medium mt-2 hover:underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by type or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 backdrop-blur-sm transition"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={toggleFilter}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition ${
                  isFiltering
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                    : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                }`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                {isFiltering ? "Hide Filters" : "Advanced Filters"}
              </button>
              {(filter.date || filter.type || filter.status || filter.minAmount || filter.maxAmount || searchQuery) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-lg text-sm font-medium flex items-center bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Clear Filters
                </motion.button>
              )}
            </div>
          </div>

          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-4" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("all")}
                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "all"
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                All Receipts
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "completed"
                    ? "border-green-500 text-green-600 dark:text-green-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "pending"
                    ? "border-yellow-500 text-yellow-600 dark:text-yellow-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Pending
              </button>
            </nav>
          </div>

          <AnimatePresence>
            {isFiltering && (
              <motion.div
                className="bg-gray-50/80 dark:bg-gray-800/40 p-6 rounded-xl mb-6 backdrop-blur-sm border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Advanced Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={filter.date}
                      onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white/60 dark:bg-gray-800/60 focus:ring-indigo-500 focus:border-indigo-500 backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <select
                      name="type"
                      value={filter.type}
                      onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white/60 dark:bg-gray-800/60 focus:ring-indigo-500 focus:border-indigo-500 backdrop-blur-sm"
                    >
                      <option value="">All Types</option>
                      {donationTypes.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select
                      name="status"
                      value={filter.status}
                      onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white/60 dark:bg-gray-800/60 focus:ring-indigo-500 focus:border-indigo-500 backdrop-blur-sm"
                    >
                      <option value="">All Statuses</option>
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Min Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="minAmount"
                      value={filter.minAmount}
                      onChange={handleFilterChange}
                      placeholder="0"
                      min="0"
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white/60 dark:bg-gray-800/60 focus:ring-indigo-500 focus:border-indigo-500 backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="maxAmount"
                      value={filter.maxAmount}
                      onChange={handleFilterChange}
                      placeholder="Any"
                      min="0"
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white/60 dark:bg-gray-800/60 focus:ring-indigo-500 focus:border-indigo-500 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300"
            >
              {filteredReceipts.length} Result{filteredReceipts.length !== 1 ? "s" : ""}
            </motion.div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-indigo-600 dark:text-indigo-400 animate-pulse">Loading your receipts...</p>
            </div>
          ) : filteredReceipts.length > 0 ? (
            <>
              <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
                {filteredReceipts.map((receipt) => (
                  <motion.div key={receipt._id} variants={listItemVariants}>
                    <ReceiptCard receipt={receipt} onDownload={handleDownload} />
                  </motion.div>
                ))}
              </motion.div>
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-indigo-700 transition"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-indigo-700 transition"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <EmptyState
              message={
                receipts.length > 0
                  ? "No receipts match your search criteria."
                  : "No donation receipts found for this phone number."
              }
              actionText={receipts.length > 0 ? "Clear Filters" : undefined}
              onAction={receipts.length > 0 ? clearFilters : undefined}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ReceiptList;