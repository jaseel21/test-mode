"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Box, User, Phone, Calendar, AlertCircle, MessageCircle, Search,
  Download, RefreshCcw, ChevronLeft, ChevronRight, Edit, Trash2, BarChart2,
  X, CheckCircle, XCircle, Clock
} from "lucide-react";
import { getPaymentStatus } from "@/lib/paymentStatus"; // Adjust path

export default function BoxesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [filteredBoxes, setFilteredBoxes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "serialNumber", direction: "ascending" });
  const [selectedBox, setSelectedBox] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);

  // Fetch boxes data
  useEffect(() => {
    const fetchBoxes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/boxes/admin/allbox",{
          method: 'GET',
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch boxes");
        const data = await response.json();
        setBoxes(data);
        setFilteredBoxes(data);
      } catch (error) {
        console.error("Error loading boxes:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBoxes();
  }, []);

  // Handle search, filter, and sort
  useEffect(() => {
    let results = boxes;
    if (searchTerm) {
      results = results.filter((box) =>
        [box.name, box.serialNumber?.toString(), box.phone, box.sessionUser?.name].some((field) =>
          field?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    if (activeFilter !== "all") results = results.filter((box) => (activeFilter === "active" ? box.isActive : !box.isActive));
    if (paymentFilter !== "all") {
      results = results.filter((box) => getPaymentStatus(box.lastPayment).status.toLowerCase() === paymentFilter);
    }
    results = [...results].sort((a, b) => {
      const aValue = sortConfig.key.includes(".") ? sortConfig.key.split(".").reduce((obj, key) => obj?.[key], a) : a[sortConfig.key];
      const bValue = sortConfig.key.includes(".") ? sortConfig.key.split(".").reduce((obj, key) => obj?.[key], b) : b[sortConfig.key];
      if (aValue === bValue) return 0;
      const direction = sortConfig.direction === "ascending" ? 1 : -1;
      return typeof aValue === "string" && typeof bValue === "string" 
        ? aValue.localeCompare(bValue) * direction 
        : ((aValue ?? "") < (bValue ?? "") ? -1 : 1) * direction;
    });
    setFilteredBoxes(results);
    setCurrentPage(1);
  }, [searchTerm, activeFilter, paymentFilter, sortConfig, boxes]);

  // Pagination and sorting
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBoxes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBoxes.length / itemsPerPage);
  const requestSort = (key) => setSortConfig((prev) => ({
    key, direction: prev.key === key && prev.direction === "ascending" ? "descending" : "ascending"
  }));
  const getSortIndicator = (key) => sortConfig.key === key ? (
    <span className="text-emerald-500 font-bold">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
  ) : null;

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Serial No", "Boxholder", "Phone", "Volunteer", "Volunteer Phone", "Last Payment", "Payment Status", "Active"];
    const csvData = filteredBoxes.map((box) => {
      const paymentStatus = getPaymentStatus(box.lastPayment);
      return [
        box.serialNumber, box.name, box.phone || "", box.sessionUser?.name || "", box.sessionUser?.phone || "", 
        box.lastPayment ? new Date(box.lastPayment).toLocaleDateString() : "", paymentStatus.status, box.isActive ? "Active" : "Inactive"
      ];
    });
    const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "donation_boxes.csv";
    link.click();
  };

  // Handle box actions
  const handleViewBox = (box) => { setSelectedBox(box); setIsModalOpen(true); };
  const confirmDeleteBox = () => setDeleteConfirmation(true);
  const handleDeleteBox = async (boxId) => {
    try {
      const response = await fetch(`/api/boxes/admin/${boxId}`, { method: "DELETE",
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
        },
       });
      if (!response.ok) throw new Error("Failed to delete box");
      setBoxes((prev) => prev.filter((b) => b._id !== boxId));
      setFilteredBoxes((prev) => prev.filter((b) => b._id !== boxId));
      setIsModalOpen(false);
      setDeleteConfirmation(false);
    } catch (error) {
      alert(`Error deleting box: ${error.message}`);
    }
  };

  // Badge styling helpers
  const getStatusBadge = (status) => {
    switch(status.toLowerCase()) {
      case 'paid': return { bg: "bg-green-100", text: "text-green-800", icon: <CheckCircle className="h-3.5 w-3.5 mr-1" /> };
      case 'overdue': return { bg: "bg-red-100", text: "text-red-800", icon: <XCircle className="h-3.5 w-3.5 mr-1" /> };
      default: return { bg: "bg-yellow-100", text: "text-yellow-800", icon: <Clock className="h-3.5 w-3.5 mr-1" /> };
    }
  };

  // Loading state with professional spinner
  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16 animate-spin mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500"></div>
        </div>
        <p className="text-gray-600 font-medium">Loading donation boxes...</p>
      </div>
    </div>
  );

  // Error state with recovery option
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-100 max-w-md w-full text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Error Loading Data</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="w-full px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center">
          <RefreshCcw className="h-5 w-5 mr-2" /> Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Box className="mr-3 h-6 w-6 text-emerald-500" /> Donation Boxes Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track, manage and analyze all donation boxes and their collection status</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Link href="/admin/boxes/add" className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center shadow-sm">
            <Box className="h-4 w-4 mr-2" /> Add New Box
          </Link>
          <Link href="/admin/dashboard" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center shadow-sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Dashboard
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: "Total Boxes", value: boxes.length, icon: <Box className="h-5 w-5 text-blue-600" />, bg: "bg-blue-50", border: "border-blue-100" },
          { title: "Active Boxes", value: boxes.filter((b) => b.isActive).length, icon: <CheckCircle className="h-5 w-5 text-green-600" />, bg: "bg-green-50", border: "border-green-100" },
          { title: "Inactive Boxes", value: boxes.filter((b) => !b.isActive).length, icon: <XCircle className="h-5 w-5 text-red-600" />, bg: "bg-red-50", border: "border-red-100" },
          { title: "Volunteers", value: new Set(boxes.map((b) => b.sessionUser?.name).filter(Boolean)).size, icon: <User className="h-5 w-5 text-purple-600" />, bg: "bg-purple-50", border: "border-purple-100" },
        ].map((stat, idx) => (
          <div key={idx} className={`bg-white rounded-xl p-5 shadow-sm border ${stat.border} hover:shadow-md transition-all`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 ${stat.bg} rounded-lg`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="relative flex-grow md:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search boxes..."
                className="pl-10 pr-10 py-2.5 w-full bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600" onClick={() => setSearchTerm("")}>
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)} className="pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-700 appearance-none relative">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="pl-3 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-700">
                <option value="all">All Payment Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
              <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-700">
                {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n} per page</option>)}
              </select>
              <button onClick={exportToCSV} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-sm">
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </button>
            </div>
          </div>
          
          {/* Results Summary */}
          <div className="text-sm text-gray-500 flex justify-between items-center">
            <span>Showing {filteredBoxes.length ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredBoxes.length)} of {filteredBoxes.length} boxes</span>
            {(searchTerm || activeFilter !== "all" || paymentFilter !== "all") && (
              <button onClick={() => { setSearchTerm(""); setActiveFilter("all"); setPaymentFilter("all"); }} className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center">
                <RefreshCcw className="h-3.5 w-3.5 mr-1" /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: "serialNumber", label: "Serial No" },
                  { key: "name", label: "Boxholder" },
                  { key: null, label: "Phone" },
                  { key: "sessionUser.name", label: "Volunteer" },
                  { key: null, label: "Vol. Phone" },
                  { key: "lastPayment", label: "Last Payment" },
                  { key: null, label: "Payment Status" },
                  { key: "isActive", label: "Status" },
                  { key: null, label: "Actions" },
                ].map((col, idx) => (
                  <th key={idx} className={`px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.key ? "cursor-pointer hover:bg-gray-100" : ""}`}
                    onClick={col.key ? () => requestSort(col.key) : undefined}>
                    <div className="flex items-center space-x-1">
                      <span>{col.label}</span>
                      {col.key && <span>{getSortIndicator(col.key)}</span>}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length ? (
                currentItems.map((box) => {
                  const paymentStatus = getPaymentStatus(box.lastPayment);
                  const statusBadge = getStatusBadge(paymentStatus.status);
                  
                  return (
                    <tr key={box._id} className="hover:bg-gray-50 transition-colors">
                      {/* Serial Number */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700">{box.serialNumber}</td>
                      
                      {/* Boxholder Name */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <Link href={`/admin/boxes/${box._id}`} className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                          {box.name || "N/A"}
                        </Link>
                      </td>
                      
                      {/* Phone */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {box.phone ? (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1 text-gray-500" />
                            {box.phone}
                          </div>
                        ) : <span className="text-gray-400">N/A</span>}
                      </td>
                      
                      {/* Volunteer */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {box.sessionUser?.name ? (
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1 text-indigo-600" />
                            {box.sessionUser.name}
                          </div>
                        ) : <span className="text-amber-600 font-medium">Not Assigned</span>}
                      </td>
                      
                      {/* Volunteer Phone */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {box.sessionUser?.phone || <span className="text-gray-400">N/A</span>}
                      </td>
                      
                      {/* Last Payment */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {box.lastPayment ? (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                            {new Date(box.lastPayment).toLocaleDateString()}
                          </div>
                        ) : <span className="text-gray-400">Never</span>}
                      </td>
                      
                      {/* Payment Status */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                          {statusBadge.icon}
                          {paymentStatus.status}
                        </span>
                      </td>
                      
                      {/* Active Status */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          box.isActive 
                            ? "bg-green-100 text-green-800 border border-green-200" 
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}>
                          {box.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      
                      {/* Actions */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-3">
                          {box.phone && (
                            <a href={`https://wa.me/${box.phone}`} target="_blank" rel="noopener noreferrer" 
                               className="text-green-600 hover:text-green-800 transition-colors" title={`Message ${box.name} on WhatsApp`}>
                              <MessageCircle className="h-5 w-5" />
                            </a>
                          )}
                          <button onClick={() => handleViewBox(box)} className="text-blue-600 hover:text-blue-800 transition-colors" title="View details">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <Link href={`/admin/boxes/track/${box._id}`} className="text-purple-600 hover:text-purple-800 transition-colors" title="View analytics">
                            <BarChart2 className="h-5 w-5" />
                          </Link>
                          <Link href={`/admin/boxes/edit/${box._id}`} className="text-gray-600 hover:text-gray-800 transition-colors" title="Edit box">
                            <Edit className="h-5 w-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-lg">No donation boxes found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || activeFilter !== "all" || paymentFilter !== "all" 
                          ? "Try adjusting your search filters" 
                          : "Add a new box to get started"}
                      </p>
                      {(searchTerm || activeFilter !== "all" || paymentFilter !== "all") && (
                        <button onClick={() => { setSearchTerm(""); setActiveFilter("all"); setPaymentFilter("all"); }}
                                className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
                          <RefreshCcw className="h-4 w-4 mr-2" /> Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredBoxes.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">Page {currentPage} of {totalPages}</div>
            <div className="flex items-center space-x-2">
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                      className={`p-2 rounded-lg ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button key={i} onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded-md ${currentPage === pageNum ? "bg-emerald-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                    {pageNum}
                  </button>
                );
              })}
              
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg ${currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Box Details Modal */}
      {isModalOpen && selectedBox && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6 pb-3 border-b border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-100 rounded-full mr-3">
                  <Box className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Box Details</h3>
                  <p className="text-sm text-gray-500">Serial Number: {selectedBox.serialNumber}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="space-y-6">
              {/* Box Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Box Information</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Boxholder:</span>
                      <span className="text-sm text-gray-800 font-semibold">{selectedBox.name || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Phone:</span>
                      <span className="text-sm text-gray-800">{selectedBox.phone || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <span className={`text-sm font-medium ${selectedBox.isActive ? "text-green-600" : "text-red-600"}`}>
                        {selectedBox.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Volunteer Assignment</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Volunteer:</span>
                      <span className="text-sm text-gray-800">
                        {selectedBox.sessionUser?.name ? (
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1 text-indigo-600" />
                            {selectedBox.sessionUser.name}
                          </span>
                        ) : "Not Assigned"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Volunteer Phone:</span>
                      <span className="text-sm text-gray-800">{selectedBox.sessionUser?.phone || "N/A"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Payment Information</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Last Payment:</span>
                      <span className="text-sm text-gray-800">
                        {selectedBox.lastPayment ? new Date(selectedBox.lastPayment).toLocaleDateString() : "Never"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Payment Status:</span>
                      <span className="text-sm">
                        {(() => {
                          const status = getPaymentStatus(selectedBox.lastPayment);
                          const badge = getStatusBadge(status.status);
                          return (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                              {badge.icon}
                              {status.status}
                            </span>
                          );
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Location Information</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">District:</span>
                      <span className="text-sm text-gray-800">{selectedBox.district || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Panchayat:</span>
                      <span className="text-sm text-gray-800">{selectedBox.panchayath || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Registered Date:</span>
                      <span className="text-sm text-gray-800">
                        {selectedBox.registeredDate ? new Date(selectedBox.registeredDate).toLocaleDateString() : "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                <button 
                  onClick={confirmDeleteBox} 
                  className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </button>
                <Link
                  href={`/admin/boxes/edit/${selectedBox._id}`}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Link>
                <Link
                  href={`/admin/boxes/track/${selectedBox._id}`}
                  className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors flex items-center"
                >
                  <BarChart2 className="h-4 w-4 mr-2" /> Analytics
                </Link>
                {selectedBox.phone && (
                  <a
                    href={`https://wa.me/${selectedBox.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                  </a>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmation && selectedBox && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Donation Box</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this box? This action cannot be undone and all data associated with this box will be permanently removed.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmation(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBox(selectedBox._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}