"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { 
  Edit2, 
  Trash2, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Search,
  Download
} from "lucide-react";

interface Volunteer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  status: "pending" | "approved" | "rejected";
  place: string;
  createdAt: string;
}

export default function ListVolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Volunteer["status"]>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Volunteer;
    direction: "ascending" | "descending";
  }>({ key: "createdAt", direction: "descending" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const router = useRouter();

  // Fetch Volunteers
  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/volunteers/find",{
          headers: {
            'x-api-key': "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
          },
        });
        const data = await response.json();
        setVolunteers(data);
        setFilteredVolunteers(data);
      } catch (error) {
        console.error("Error fetching volunteers:", error);
        toast.error("Failed to load volunteers");
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, []);

  // Filtering and Sorting Logic
  useEffect(() => {
    let result = [...volunteers];

    if (searchTerm) {
      result = result.filter(vol => 
        vol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vol.phone.includes(searchTerm) ||
        vol.place.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(vol => vol.status === statusFilter);
    }

    result.sort((a, b) => {
      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];

      if (valueA === undefined || valueB === undefined) return 0;

      if (typeof valueA === "string") {
        return sortConfig.direction === "ascending"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return sortConfig.direction === "ascending"
        ? (valueA as number) - (valueB as unknown as number)
        : (valueB as unknown as number) - (valueA as number);
    });

    setFilteredVolunteers(result);
    setCurrentPage(1);
  }, [volunteers, searchTerm, statusFilter, sortConfig]);

  // Sorting handler
  const handleSort = (key: keyof Volunteer) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "ascending" 
        ? "descending" 
        : "ascending"
    }));
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredVolunteers.length / itemsPerPage);
  const paginatedVolunteers = filteredVolunteers.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // Delete Volunteer
  const deleteVolunteer = async (volunteerId: string, volunteerName: string) => {
    toast(
      <div className="p-4 text-center">
        <Trash2 className="mx-auto mb-4 w-12 h-12 text-red-500" />
        <h2 className="text-lg font-semibold mb-2">Delete Volunteer</h2>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete &quot;{volunteerName}&quot;?
        </p>
        <div className="flex justify-center space-x-3">
          <button 
            onClick={() => toast.dismiss()} 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button 
            onClick={async () => {
              try {
                const response = await fetch(`/api/volunteers/${volunteerId}`, {
                  method: "DELETE",
                  headers: {
                    'x-api-key': "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
                  },
                });

                if (response.ok) {
                  setVolunteers((prev) => prev.filter((vol) => vol._id !== volunteerId));
                  toast.success("Volunteer deleted successfully");
                } else {
                  throw new Error("Failed to delete volunteer");
                }
                toast.dismiss();
              } catch (error) {
                console.error("Error deleting volunteer:", error);
                toast.error("Failed to delete volunteer");
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeButton: false,
        className: "rounded-lg shadow-xl"
      }
    );
  };

  // Update Volunteer Status
  const updateStatus = async (volunteerId: string, newStatus: "pending" | "approved" | "rejected") => {
    try {
      const response = await fetch(`/api/volunteers/${volunteerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json",
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
         },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setVolunteers((prev) =>
          prev.map((vol) => (vol._id === volunteerId ? { ...vol, status: newStatus } : vol))
        );
        toast.success("Status updated successfully", {
          position: "top-center",
          className: "rounded-md shadow-md",
        });
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status", {
        position: "top-center",
        className: "rounded-md shadow-md",
      });
    }
  };

  // Export Volunteers to CSV
  const handleExportVolunteers = () => {
    const headers = ["Name", "Phone", "Place", "Status", "Created Date"];
    const csvData = filteredVolunteers.map(vol => [
      vol.name,
      vol.phone,
      vol.place,
      vol.status,
      new Date(vol.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "volunteers_export.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status Dropdown Component
  const StatusDropdown = ({ volunteer }: { volunteer: Volunteer }) => {
    const getStatusStyles = (status: Volunteer["status"]) => {
      switch (status) {
        case "approved":
          return "bg-green-100 text-green-800 border-green-300";
        case "rejected":
          return "bg-red-100 text-red-800 border-red-300";
        case "pending":
        default:
          return "bg-yellow-100 text-yellow-800 border-yellow-300";
      }
    };

    return (
      <select
        value={volunteer.status}
        onChange={(e) => updateStatus(volunteer._id, e.target.value as "pending" | "approved" | "rejected")}
        className={`px-2 py-1 rounded-md border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 ${getStatusStyles(volunteer.status)}`}
      >
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
    );
  };

  // Pagination Controls
  const PaginationControls = () => (
    <div className="flex justify-center items-center space-x-2 mt-4 pb-4">
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse w-16 h-16 mx-auto mb-4 bg-gray-300 rounded-full"></div>
          <p className="text-gray-600 text-lg">Loading Volunteers...</p>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Volunteer Management</h1>
          <button 
            onClick={() => router.push('/admin/volunteers/create')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>Add Volunteer</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-6 flex items-center space-x-4">
          <div className="relative flex-grow">
            <input 
              type="text" 
              placeholder="Search volunteers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-gray-700">Status:</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | Volunteer["status"])}
              className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <button
            onClick={handleExportVolunteers}
            className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>

        {/* Volunteers Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {paginatedVolunteers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No volunteers found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    {[
                      { key: "name", label: "Name" },
                      { key: "phone", label: "Phone" },
                      { key: "place", label: "Place" },
                      { key: "createdAt", label: "Created Date" },
                      { label: "Status" },
                      { label: "Actions" }
                    ].map((header) => (
                      <th 
                        key={header.label} 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header.key ? (
                          <button 
                            onClick={() => handleSort(header.key as keyof Volunteer)}
                            className="flex items-center space-x-1 hover:text-gray-700"
                          >
                            <span>{header.label}</span>
                            {sortConfig.key === header.key && (
                              sortConfig.direction === "ascending" 
                                ? <ChevronUp size={16} /> 
                                : <ChevronDown size={16} />
                            )}
                          </button>
                        ) : (
                          header.label
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedVolunteers.map((volunteer) => (
                    <tr 
                      key={volunteer._id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {volunteer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {volunteer.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {volunteer.place}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(volunteer.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusDropdown volunteer={volunteer} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => router.push(`/admin/volunteers/edit/${volunteer._id}`)}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => deleteVolunteer(volunteer._id, volunteer.name)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/volunteers/track?phone=${encodeURIComponent(volunteer.phone)}`)}
                            className="text-green-500 hover:text-green-700 transition-colors"
                            title="Track"
                          >
                            <MapPin size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <PaginationControls />
      </div>
    </div>
  );
}