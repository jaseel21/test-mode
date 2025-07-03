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
  Clock,
  Users,
  Heart,
  AlertCircle,
} from "lucide-react";

export default function OngoingCampaignsPage() {
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("endDate");
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const categories = [
    "All Categories",
    "fundraising",
    "building",
    "orphan-care",
    "education",
    "emergency-relief",
    "zakat",
  ];

  // Fetch campaigns from API
  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/campaigns/admin?status=active", {
          method: "GET",
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        });
        const data = await response.json();
        console.log("Fetched campaigns:", data);
        setCampaigns(data);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  // Calculate days remaining
  const calculateDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filter and sort campaigns
  const filteredCampaigns = campaigns
    .filter((campaign) => {
      const matchesSearch =
        campaign.name.toLowerCase().includes(searchText.toLowerCase()) ||
        campaign._id.toLowerCase().includes(searchText.toLowerCase()) ||
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
        case "progress":
          return (b.currentAmount / b.goal) * 100 - (a.currentAmount / a.goal) * 100;
        case "raised":
          return b.currentAmount - a.currentAmount;
        case "endDate":
        default:
          return calculateDaysRemaining(a.endDate) - calculateDaysRemaining(b.endDate);
      }
    });

  // Delete campaign
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
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            Ongoing Campaigns
            <span className="text-sm font-normal bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 py-0.5 px-2 rounded-full">
              {filteredCampaigns.length} Active
            </span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor and manage your organization&apos;s active fundraising campaigns
          </p>
        </div>
        <Link
          href="/campaigns/create"
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center shadow-lg"
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Create Campaign
        </Link>
      </div>

      {/* Filters section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              >
                <option value="endDate">Urgency (End Date)</option>
                <option value="name">Campaign Name</option>
                <option value="progress">Progress</option>
                <option value="raised">Amount Raised</option>
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
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              >
                <option value="endDate">Urgency (End Date)</option>
                <option value="name">Campaign Name</option>
                <option value="progress">Progress</option>
                <option value="raised">Amount Raised</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="relative w-12 h-12">
            <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
            <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-emerald-500 animate-spin"></div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredCampaigns.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
            <AlertCircle className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No campaigns found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            No campaigns match your current search or filter criteria. Try adjusting your filters or create a new campaign.
          </p>
          <Link
            href="/campaigns/create"
            className="mt-6 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center"
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Create Campaign
          </Link>
        </div>
      )}

      {/* Campaigns grid */}
      {!isLoading && filteredCampaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => {
            const progress =
              campaign.isInfinite || !campaign.goal
                ? 0
                : Math.round((campaign.currentAmount / campaign.goal) * 100);
            const daysRemaining = calculateDaysRemaining(campaign.endDate);
            return (
              <div
                key={campaign._id}
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden hover:translate-y-[-5px] transition-all duration-300 flex flex-col"
              >
                <div className="h-48 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 relative">
                  <Image
                    src={getCampaignImageUrl(campaign)}
                    alt={campaign.name}
                    width={800} // Matches placeholder dimensions
                    height={400} // Matches placeholder dimensions and h-48 (192px scaled up)
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className="px-2 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full text-xs font-medium text-emerald-800 dark:text-emerald-400 shadow-lg">
                      {campaign.type}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                        daysRemaining < 30
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {daysRemaining} days left
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
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Progress</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {campaign.isInfinite ? "Infinite" : `${progress}%`}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                        style={{ width: campaign.isInfinite ? "100%" : `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/20 dark:bg-gray-800/20 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <Users className="h-3 w-3 mr-1" /> Donors
                      </div>
                      <p className="font-semibold text-gray-800 dark:text-white">N/A</p>
                    </div>
                    <div className="bg-white/20 dark:bg-gray-800/20 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <Heart className="h-3 w-3 mr-1" /> Raised
                      </div>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{campaign.currentAmount.toLocaleString()}
                      </p>
                      {!campaign.isInfinite && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          of ₹{campaign.goal.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                    {campaign.description}
                  </p>
                </div>
                <div className="p-4 pt-0 flex justify-between">
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
                    <Link
                      href={`/admin/campaigns/edit/${campaign._id}`}
                      className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(campaign._id, campaign.name)}
                      className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}