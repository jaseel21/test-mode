"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // Added import for Next.js Image
import {
  Search,
  BarChart2,
  Edit,
  Trash2,
  PlusCircle,
  Filter,
  ChevronDown,
  Eye,
  Users,
  Heart,
  AlertCircle,
  CalendarRange,
} from "lucide-react";

export default function UpcomingCampaignsPage() {
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("startDate");
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const categories = [
    "All Categories",
    "Fundraising",
    "Building",
    "Orphan Care",
    "Education",
    "Emergency Relief",
    "Zakat",
  ];

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        console.log("Fetching campaigns from /api/campaigns/upcoming...");
        const response = await fetch("/api/campaigns/all", {
          method: "GET",
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        });
        console.log("Response status:", response.status, response.statusText);

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Raw error response:", errorData);
          throw new Error(`Failed to fetch campaigns: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched campaigns:", data);
        setCampaigns(data);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        alert("Failed to load campaigns: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const getDaysUntilLaunch = (startDate) => {
    const today = new Date();
    const launchDate = new Date(startDate);
    const diffTime = launchDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredCampaigns = campaigns
    .filter((campaign) => {
      const matchesSearch =
        campaign.name.toLowerCase().includes(searchText.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory =
        filterCategory === "" ||
        filterCategory === "All Categories" ||
        campaign.type === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "status":
          return a.status.localeCompare(b.status);
        case "goal":
          return b.goal - a.goal;
        case "startDate":
        default:
          return new Date(a.startDate) - new Date(b.startDate);
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to delete campaign "${name}"?`)) {
      try {
        const response = await fetch(`/api/campaigns/delete/${id}`, {
          method: "DELETE",
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        });
        if (response.ok) {
          setCampaigns(campaigns.filter((c) => c._id !== id));
          alert(`Campaign ${id} deleted!`);
        } else {
          alert("Failed to delete campaign.");
        }
      } catch (error) {
        console.error("Error deleting campaign:", error);
        alert("Error deleting campaign.");
      }
    }
  };

  // Function to get the image URL with fallback
  const getCampaignImageUrl = (campaign) => {
    if (campaign.featuredImageUrl) {
      return campaign.featuredImageUrl;
    }
    if (campaign.featuredImage && campaign.featuredImageType) {
      if (typeof campaign.featuredImage === "string") {
        return campaign.featuredImage;
      }
      return "/api/placeholder/800/400";
    }
    return "/api/placeholder/800/400";
  };

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            All Campaigns
            <span className="text-sm font-normal bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 py-0.5 px-2 rounded-full">
              {filteredCampaigns.length} Planned
            </span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View and prepare campaigns scheduled to launch in the future
          </p>
        </div>

        <Link
          href="/campaigns/create"
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center shadow-lg"
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Create Campaign
        </Link>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search upcoming campaigns..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              >
                <option value="startDate">Launch Date (Soonest First)</option>
                <option value="name">Campaign Name</option>
                <option value="status">Status</option>
                <option value="goal">Target Amount</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <button
              className="md:hidden px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <Filter className="h-4 w-4 mr-2" /> Filters
            </button>
          </div>
        </div>

        {showMobileFilters && (
          <div className="mt-4 md:hidden space-y-3 border-t border-white/10 pt-4 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              >
                <option value="startDate">Launch Date (Soonest First)</option>
                <option value="name">Campaign Name</option>
                <option value="status">Status</option>
                <option value="goal">Target Amount</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="relative w-12 h-12">
            <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
            <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
          </div>
        </div>
      )}

      {!isLoading && filteredCampaigns.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
            <AlertCircle className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No upcoming campaigns found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            No upcoming campaigns match your current search or filter criteria. Try adjusting your filters or plan a new campaign.
          </p>
          <Link
            href="/campaigns/create"
            className="mt-6 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center"
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Plan New Campaign
          </Link>
        </div>
      )}

      {!isLoading && filteredCampaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <div
              key={campaign._id}
              className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden hover:translate-y-[-5px] transition-all duration-300 flex flex-col"
            >
              <div className="h-48 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 relative">
                <Image
                  src={getCampaignImageUrl(campaign)}
                  alt={campaign.name}
                  width={800} // Matches placeholder dimensions
                  height={400} // Matches placeholder dimensions and h-48 (192px scaled up)
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                <div className="absolute top-4 left-4">
                  <span className="px-2 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full text-xs font-medium text-blue-800 dark:text-blue-400 shadow-lg">
                    {campaign.type}
                  </span>
                </div>

                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-bold text-white line-clamp-2">{campaign.name}</h3>
                </div>
              </div>

              <div className="p-4 flex-grow">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Campaign ID: {campaign._id}
                </div>

                <div className="mb-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3">
                  <div className="flex items-center text-blue-700 dark:text-blue-400 mb-1">
                    <CalendarRange className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Scheduled Launch</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {new Date(campaign.startDate).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                      In {getDaysUntilLaunch(campaign.startDate)} days
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/20 dark:bg-gray-800/20 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <Users className="h-3 w-3 mr-1" /> Target Audience
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-white">{campaign.targetAudience || "N/A"}</p>
                  </div>

                  {campaign.isInfinite === true ? null : (
                    <div className="bg-white/20 dark:bg-gray-800/20 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <Heart className="h-3 w-3 mr-1" /> Target Goal
                      </div>
                      <p className="font-semibold text-blue-600 dark:text-blue-400">₹{campaign.goal.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                  {campaign.description}
                </p>
              </div>

              <div className="p-4 pt-0 flex justify-between">
                <Link
                  href={`/admin/campaigns/edit/${campaign._id}`}
                  className="px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit Details
                </Link>

                <Link
                  href={
                    campaign.type === "physical"
                      ? `/admin/campaigns/track/physical?id=${campaign._id}`
                      : `/admin/campaigns/track?id=${campaign._id}`
                  }
                  className="px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
                >
                  <BarChart2 className="h-4 w-4 mr-2" /> Track Progress
                </Link>

                <div className="flex space-x-2">
                  <Link
                    href={`/campaigns/detail?id=${campaign._id}`}
                    className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
                    onClick={() => handleDelete(campaign._id, campaign.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}