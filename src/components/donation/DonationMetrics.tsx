"use client";
import React, { useState, useEffect, useRef } from "react";

interface DonationStats {
  totalDonations: number;
  thisMonthDonations: number;
  todayDonations: number;
  weekDonations: number;
  generalTotal: number;
  yatheemTotal: number;
  hafizTotal: number;
  buildingTotal: number;
  subscribersDonorCount: number;
  totalVolunteers: number;
  activeCampaigns: number;
}

const DonationMetrics: React.FC = () => {
  const [stats, setStats] = useState<DonationStats>({
    totalDonations: 0,
    thisMonthDonations: 0,
    todayDonations: 0,
    weekDonations: 0,
    generalTotal: 0,
    yatheemTotal: 0,
    hafizTotal: 0,
    buildingTotal: 0,
    subscribersDonorCount: 0,
    totalVolunteers: 0,
    activeCampaigns: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchDonations() {
      try {
        setLoading(true);
        const response = await fetch("/api/find_total", {
          headers: {
            "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
          },
        });
        if (!response.ok) throw new Error("Failed to fetch data");
        const data: DonationStats = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching donation stats:", error);
        setError("Failed to load donation metrics");
      } finally {
        setLoading(false);
      }
    }
    fetchDonations();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDonationByPeriod = (): number => {
    switch (selectedPeriod) {
      case "today":
        return stats.todayDonations;
      case "week":
        return stats.weekDonations || 0;
      case "month":
        return stats.thisMonthDonations;
      default:
        return stats.todayDonations;
    }
  };

  const periodOptions: { value: "today" | "week" | "month"; label: string }[] = [
    { value: "today", label: "Daily" },
    { value: "week", label: "Weekly" },
    { value: "month", label: "Monthly" },
  ];

  if (loading) {
    return <div className="text-center p-6">Loading donation metrics...</div>;
  }

  if (error) {
    return <div className="text-center p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Donation Metrics</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm p-5 rounded-xl hover:bg-white/30 transition-all duration-300 text-center shadow-lg">
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Donations</h4>
          <p className="text-2xl font-bold text-brand-600 dark:text-white">₹{stats.totalDonations.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm p-5 rounded-xl hover:bg-white/30 transition-all duration-300 text-center shadow-lg">
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Active Campaigns</h4>
          <p className="text-2xl font-bold text-brand-600 dark:text-white">{stats.activeCampaigns}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm p-5 rounded-xl hover:bg-white/30 transition-all duration-300 text-center shadow-lg">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Donations</h4>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-md"
              >
                {periodOptions.find((opt) => opt.value === selectedPeriod)?.label}
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 w-32 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
                  {periodOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedPeriod(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`block w-full text-left px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-600 hover:text-white ${
                        selectedPeriod === option.value ? "bg-brand-600 text-white" : ""
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="text-2xl font-bold text-brand-600 dark:text-white">₹{getDonationByPeriod().toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm p-5 rounded-xl hover:bg-white/30 transition-all duration-300 text-center shadow-lg">
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">General Total</h4>
          <p className="text-2xl font-bold text-brand-600 dark:text-white">₹{stats.generalTotal.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm p-5 rounded-xl hover:bg-white/30 transition-all duration-300 text-center shadow-lg">
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Building Total</h4>
          <p className="text-2xl font-bold text-brand-600 dark:text-white">₹{stats.buildingTotal.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm p-5 rounded-xl hover:bg-white/30 transition-all duration-300 text-center shadow-lg">
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Subscription Donors</h4>
          <p className="text-2xl font-bold text-brand-600 dark:text-white">{stats.subscribersDonorCount}</p>
        </div>
      </div>
    </div>
  );
};

export default DonationMetrics;