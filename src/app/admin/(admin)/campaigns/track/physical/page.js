// src/app/admin/(admin)/campaigns/track/physical/page.js
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  BarChart2,
  Share2,
  Edit,
  Download,
  Printer,
  Building2,
  MapPin,
  AlertCircle,
  MessageCircle,
} from "lucide-react";

export default function PhysicalTrackProgressPage() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("contributions");
  const [timeRange, setTimeRange] = useState("month");
  const [error, setError] = useState(null);
  const [campaignData, setCampaignData] = useState({
    id: "",
    name: "",
    type: "",
    startDate: "",
    endDate: "",
    daysLeft: 0,
    description: "",
    location: "",
    institution: "",
    featuredImage: "",
    donorCount: 0,
    physicalDonations: [],
    physicalTotalCount: 0,
    isInfinite: false,
    goal: null,
    progress: 0,
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

        const physicalDonationsResponse = await fetch(`/api/donations/physical/campaign/${campaignId}`,{
          method: 'GET',
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
          },
        });
        if (!physicalDonationsResponse.ok) {
          const errorData = await physicalDonationsResponse.json();
          throw new Error(errorData.error || "Failed to fetch physical donations");
        }
        const physicalDonations = await physicalDonationsResponse.json();

        const today = new Date();
        const endDate = new Date(campaign.endDate);
        const daysLeft = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
        const physicalTotalCount = physicalDonations.reduce((sum, d) => sum + d.count, 0);
        const goal = campaign.goal || null;
        const progress = goal ? Math.min(100, Math.round((physicalTotalCount / goal) * 100)) : 0;

        setCampaignData({
          id: campaign._id || "",
          name: campaign.name || "",
          type: campaign.type || "",
          startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split("T")[0] : "",
          endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split("T")[0] : "",
          daysLeft,
          description: campaign.description || "",
          location: campaign.area || "",
          institution: campaign.institution || "",
          featuredImage: campaign.featuredImage || "",
          donorCount: physicalDonations.length,
          physicalDonations: physicalDonations || [],
          physicalTotalCount,
          isInfinite: campaign.isInfinite || false,
          goal,
          progress,
        });
      } catch (error) {
        console.error("Error loading data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [campaignId]);

  const getProgressColor = (progress) => {
    if (progress < 25) return "from-red-500 to-red-600";
    if (progress < 50) return "from-orange-500 to-orange-600";
    if (progress < 75) return "from-yellow-500 to-yellow-600";
    return "from-emerald-500 to-green-600";
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 flex justify-center items-center min-h-[400px]">
        <div className="relative w-12 h-12 animate-spin">
          <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
          <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-emerald-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Error Loading Campaign</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-300"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white flex items-center">
            <BarChart2 className="mr-2 h-6 w-6 text-emerald-500" />
            {campaignData.name} <span className="ml-2 text-sm text-gray-500">(Physical Donations)</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track performance and monitor physical contributions for this campaign
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
            href="/admin/campaigns/ongoing"
            className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Campaigns
          </Link>
        </div>
      </div>

      {/* Campaign progress and stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="flex h-full flex-col">
            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 p-4 border-b border-white/10">
              <h3 className="text-sm font-medium text-gray-800 dark:text-white">Physical Contribution Overview</h3>
            </div>
            <div className="p-6 flex-grow flex flex-col space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4 text-center transform transition-all duration-300 hover:scale-105">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Contributors</p>
                  <p className="text-xl font-semibold text-gray-800 dark:text-white">{campaignData.donorCount}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center transform transition-all duration-300 hover:scale-105">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Items Donated</p>
                  <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">{campaignData.physicalTotalCount}</p>
                </div>
              </div>

              {campaignData.physicalDonations.length > 0 && (
                <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-4 flex items-center">
                    <BarChart2 className="h-4 w-4 mr-2 text-emerald-500" />
                    Campaign Progress
                  </h3>
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
                          strokeDashoffset={251.2 - (251.2 * (campaignData.isInfinite ? 100 : campaignData.progress)) / 100}
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
                        {campaignData.goal && !campaignData.isInfinite ? (
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
                </div>
              )}

              {!campaignData.isInfinite && (
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
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
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
              )}
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 p-4 border-b border-white/10">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white">Campaign Details</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">Campaign Type</h4>
              <p className="font-medium text-gray-800 dark:text-white flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-blue-500" />
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
              <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">Contributor Statistics</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 p-2 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Contributors</p>
                  <p className="font-medium text-gray-800 dark:text-white">{campaignData.donorCount}</p>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Items</p>
                  <p className="font-medium text-gray-800 dark:text-white">{campaignData.physicalTotalCount}</p>
                </div>
              </div>
            </div>
            <div className="pt-2">
              <div className="flex justify-between gap-2">
                <button className="text-xs bg-white/10 hover:bg-white/20 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 flex items-center transition-colors duration-300">
                  <Share2 className="h-3 w-3 mr-1" /> Share
                </button>
                <button className="text-xs bg-white/10 hover:bg-white/20 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 flex items-center transition-colors duration-300">
                  <Printer className="h-3 w-3 mr-1" /> Print
                </button>
                <button className="text-xs bg-white/10 hover:bg-white/20 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 flex items-center transition-colors duration-300">
                  <Download className="h-3 w-3 mr-1" /> Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div className="flex border-b border-white/10 overflow-x-auto">
          {["contributions", "contributors"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                activeTab === tab
                  ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-4 md:p-6">
          <div className="flex justify-end mb-6">
            <div className="bg-white/5 rounded-lg p-1 flex gap-1">
              {["week", "month", "year", "all"].map((range) => (
                <button
                  key={range}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 ${
                    timeRange === range
                      ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-white/5"
                  }`}
                  onClick={() => setTimeRange(range)}
                >
                  {range === "all" ? "All Time" : range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "contributions" && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-4">All Contributions</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contributor</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">District</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Panchayat</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {campaignData.physicalDonations.map((donation) => (
                        <tr key={donation.id} className="hover:bg-white/5 transition-colors duration-200">
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">{donation.name}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{donation.phone || "N/A"}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-emerald-600 dark:text-emerald-400">{donation.count}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{donation.district}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{donation.panchayat || "N/A"}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{donation.date}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            {donation.phone ? (
                              <a
                                href={`https://wa.me/${donation.phone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200"
                                title={`Message ${donation.name} on WhatsApp`}
                              >
                                <MessageCircle className="h-5 w-5" />
                              </a>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "contributors" && (
            <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Contributors Tab Under Development</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md text-center">
                The contributors view is currently being developed and will be available soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}