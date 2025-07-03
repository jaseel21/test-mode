// src/app/campaigns/track/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation"; // Add useRouter
import {
  ArrowLeft,
  Calendar,
  LineChart,
  BarChart2,
  PieChart,
  Heart,
  Share2,
  Edit,
  Download,
  Printer,
  Building2,
  MapPin,
  AlertCircle,
} from "lucide-react";

export default function TrackProgressPage() {
  const searchParams = useSearchParams();
  const router = useRouter(); // Add router
  const campaignId = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("month");
  const [error, setError] = useState(null);
  const [campaignData, setCampaignData] = useState({
    id: "",
    name: "",
    type: "",
    category: "",
    goal: 0,
    currentAmount: 0,
    donorCount: 0,
    startDate: "",
    endDate: "",
    daysLeft: 0,
    progress: 0,
    description: "",
    location: "",
    institution: "",
    featuredImage: "",
    donorStats: { recurring: 0, firstTime: 0, total: 0, average: 0 },
    donations: [],
    physicalDonations: [],
    physicalTotalCount: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!campaignId) {
        setError("No campaign ID provided");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch campaign details
        const campaignResponse = await fetch(`/api/campaigns/${campaignId}`,{
          method: 'GET',
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
          },
        });
        if (!campaignResponse.ok) {
          const errorData = await campaignResponse.json();
          throw new Error(errorData.error || "Failed to fetch campaign");
        }
        const campaign = await campaignResponse.json();

        // Redirect if campaign.type is "physical"
        // if (campaign.type === "physical") {
        //   router.push(`/admin/campaigns/track/physical?id=${campaignId}`);
        //   return; // Stop further execution
        // }

        // Fetch monetary donations (for non-physical campaigns)
        let donations = [];
        if (campaign.type !== "physical") {
          const donationsResponse = await fetch(`/api/donations/campaign/${campaignId}`,{
            method: 'GET',
            headers: {
              'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
            },
          });
          if (!donationsResponse.ok) {
            const errorData = await donationsResponse.json();
            throw new Error(errorData.error || "Failed to fetch donations");
          }
          donations = await donationsResponse.json();
        }

        // Calculate days left
        const today = new Date();
        const endDate = new Date(campaign.endDate);
        const daysLeft = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));

        // Calculate donor stats for monetary donations
        const donorStats = {
          recurring: donations.filter((d) => d.userId && d.userId !== "guest").length,
          firstTime: donations.filter((d) => !d.userId || d.userId === "guest").length,
          total: donations.length,
          average: donations.length
            ? Math.round(donations.reduce((sum, d) => sum + d.amount, 0) / donations.length)
            : 0,
        };

        // Calculate progress for monetary campaigns
        const progress = campaign.goal ? Math.round((campaign.currentAmount / campaign.goal) * 100) : 0;

        setCampaignData({
          id: campaign._id || "",
          name: campaign.name || "",
          type: campaign.type || "",
          category: campaign.category || "",
          goal: campaign.goal || 0,
          currentAmount: campaign.currentAmount || 0,
          donorCount: donorStats.total,
          startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split("T")[0] : "",
          endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split("T")[0] : "",
          daysLeft,
          progress,
          description: campaign.description || "",
          location: campaign.area || "",
          institution: campaign.institution || "",
          featuredImage: campaign.featuredImage || "",
          donorStats,
          donations: donations || [],
          physicalDonations: [],
          physicalTotalCount: 0,
        });
      } catch (error) {
        console.error("Error loading data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [campaignId, router]); // Add router to dependencies

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 flex justify-center items-center min-h-[400px]">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
          <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-emerald-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Error Loading Campaign</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const getProgressColor = (progress) => {
    if (progress < 25) return "from-red-500 to-red-600";
    if (progress < 50) return "from-orange-500 to-orange-600";
    if (progress < 75) return "from-yellow-500 to-yellow-600";
    return "from-emerald-500 to-green-500";
  };

  const formatCurrency = (amount) => `₹${Number(amount).toLocaleString()}`;

  // Rest of your original JSX remains unchanged
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white flex items-center">
            <BarChart2 className="mr-2 h-6 w-6 text-emerald-500" />
            {campaignData.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track performance and monitor donations for this campaign
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/campaigns/edit?id=${campaignId}`}
            className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" /> Edit Campaign
          </Link>
          <Link
            href="/campaigns/ongoing"
            className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Campaigns
          </Link>
        </div>
      </div>

      {/* Campaign progress and stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          <div className="flex h-full flex-col">
            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 p-4 border-b border-white/10">
              <h3 className="text-sm font-medium text-gray-800 dark:text-white">Campaign Progress</h3>
            </div>
            <div className="p-6 flex-grow flex flex-col">
              {/* {campaignData.featuredImage && (
                <div className="mb-6">
                  <img
                    src={campaignData.featuredImage}
                    alt={campaignData.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )} */}
              <div className="flex justify-center mb-6">
                <div className="relative h-40 w-40">
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="url(#progress-gradient)"
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * campaignData.progress) / 100}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop
                          offset="0%"
                          stopColor={
                            getProgressColor(campaignData.progress).includes("from-red")
                              ? "#ef4444"
                              : getProgressColor(campaignData.progress).includes("from-orange")
                              ? "#f97316"
                              : getProgressColor(campaignData.progress).includes("from-yellow")
                              ? "#eab308"
                              : "#10b981"
                          }
                        />
                        <stop
                          offset="100%"
                          stopColor={
                            getProgressColor(campaignData.progress).includes("to-red")
                              ? "#dc2626"
                              : getProgressColor(campaignData.progress).includes("to-orange")
                              ? "#ea580c"
                              : getProgressColor(campaignData.progress).includes("to-yellow")
                              ? "#ca8a04"
                              : "#059669"
                          }
                        />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    {campaignData.goal ? (
                      <>
                        <span className="text-3xl font-bold text-gray-800 dark:text-white">{campaignData.progress}%</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Completed</span>
                      </>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-gray-800 dark:text-white">Infinite</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">No Goal Set</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Goal</p>
                  <p className="text-xl font-semibold text-gray-800 dark:text-white">{formatCurrency(campaignData.goal)}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Raised</p>
                  <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(campaignData.currentAmount)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Remaining</p>
                  <p className="text-xl font-semibold text-gray-800 dark:text-white">
                    {formatCurrency(campaignData.goal - campaignData.currentAmount)}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-1" /> Start Date
                    <span className="ml-2 text-gray-800 dark:text-white font-medium">{campaignData.startDate}</span>
                  </span>
                  <span className="flex items-center text-gray-500 dark:text-gray-400">
                    End Date <Calendar className="h-4 w-4 ml-1 mr-1" />
                    <span className="ml-2 text-gray-800 dark:text-white font-medium">{campaignData.endDate}</span>
                  </span>
                </div>
                <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(campaignData.progress)}`}
                    style={{
                      width: `${Math.min(
                        100,
                        ((new Date().getTime() - new Date(campaignData.startDate).getTime()) /
                          (new Date(campaignData.endDate).getTime() - new Date(campaignData.startDate).getTime())) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-end">
                  <span className="text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded-full flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {campaignData.daysLeft} days remaining
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 p-4 border-b border-white/10">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white">Campaign Details</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">Campaign Type</h4>
              <p className="font-medium text-gray-800 dark:text-white flex items-center">
                {campaignData.type === "Fundraising" ? (
                  <Heart className="h-4 w-4 mr-2 text-pink-500" />
                ) : (
                  <Building2 className="h-4 w-4 mr-2 text-blue-500" />
                )}
                {campaignData.type}
              </p>
            </div>
            <div>
              <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">Description</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">{campaignData.description}</p>
            </div>
            <div>
              <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">Location</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-red-500" />
                {campaignData.location}
              </p>
            </div>
            <div>
              <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">Institution</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-indigo-500" />
                {campaignData.institution}
              </p>
            </div>
            <div>
              <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">Donor Statistics</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 p-2 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Donors</p>
                  <p className="font-medium text-gray-800 dark:text-white">{campaignData.donorStats.total}</p>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Donation</p>
                  <p className="font-medium text-gray-800 dark:text-white">₹{campaignData.donorStats.average}</p>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Recurring</p>
                  <p className="font-medium text-gray-800 dark:text-white">{campaignData.donorStats.recurring}</p>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">First-time</p>
                  <p className="font-medium text-gray-800 dark:text-white">{campaignData.donorStats.firstTime}</p>
                </div>
              </div>
            </div>
            <div className="pt-2">
              <div className="flex justify-between">
                <button className="text-xs bg-white/10 hover:bg-white/20 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 flex items-center transition-colors">
                  <Share2 className="h-3 w-3 mr-1" /> Share
                </button>
                <button className="text-xs bg-white/10 hover:bg-white/20 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 flex items-center transition-colors">
                  <Printer className="h-3 w-3 mr-1" /> Print
                </button>
                <button className="text-xs bg-white/10 hover:bg-white/20 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 flex items-center transition-colors">
                  <Download className="h-3 w-3 mr-1" /> Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
        <div className="flex border-b border-white/10 overflow-x-auto">
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "overview"
                ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "donors"
                ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("donors")}
          >
            Donors
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "donations"
                ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("donations")}
          >
            Donations
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "analytics"
                ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </button>
        </div>

        <div className="p-4 md:p-6">
          <div className="flex justify-end mb-6">
            <div className="bg-white/5 rounded-lg p-1 flex">
              <button
                className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                  timeRange === "week"
                    ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-white/5"
                }`}
                onClick={() => setTimeRange("week")}
              >
                Week
              </button>
              <button
                className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                  timeRange === "month"
                    ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-white/5"
                }`}
                onClick={() => setTimeRange("month")}
              >
                Month
              </button>
              <button
                className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                  timeRange === "year"
                    ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-white/5"
                }`}
                onClick={() => setTimeRange("year")}
              >
                Year
              </button>
              <button
                className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                  timeRange === "all"
                    ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-white/5"
                }`}
                onClick={() => setTimeRange("all")}
              >
                All Time
              </button>
            </div>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-4 flex items-center">
                    <LineChart className="h-4 w-4 mr-2 text-emerald-500" />
                    Donation Trend
                  </h3>
                  <div className="h-48 flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="text-center">
                      <LineChart className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Donation trend visualization</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-4 flex items-center">
                    <PieChart className="h-4 w-4 mr-2 text-blue-500" />
                    Donation Sources
                  </h3>
                  <div className="h-48 flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Donation sources breakdown</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-4">Key Metrics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Total Donors</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">{campaignData.donorStats.total}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
                    <p className="text-xs text-blue-600 dark:text-blue-400">Recurring Donors</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">{campaignData.donorStats.recurring}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
                    <p className="text-xs text-purple-600 dark:text-purple-400">First-time Donors</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">{campaignData.donorStats.firstTime}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10">
                    <p className="text-xs text-amber-600 dark:text-amber-400">Avg. Donation</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">₹{campaignData.donorStats.average}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-4">Recent Donations</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Donor</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {campaignData.donations.slice(0, 5).map((donation) => (
                        <tr key={donation.id} className="hover:bg-white/5">
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">{donation.name}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-emerald-600 dark:text-emerald-400">₹{donation.amount}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{donation.date}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                donation.status === "Completed"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              }`}
                            >
                              {donation.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-center">
                  <button className="text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                    View All Donations
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === "donations" && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-4">All Donations</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Donor</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Method</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {campaignData.donations.map((donation) => (
                        <tr key={donation.id} className="hover:bg-white/5">
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">{donation.name}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-emerald-600 dark:text-emerald-400">₹{donation.amount}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{donation.date}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{donation.method}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                donation.status === "Completed"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              }`}
                            >
                              {donation.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {activeTab === "donors" && (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Donors Tab Under Development</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md text-center">
                The donors view is currently being developed and will be available soon.
              </p>
            </div>
          )}
          {activeTab === "analytics" && (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Analytics Tab Under Development</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md text-center">
                The analytics view is currently being developed and will be available soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}