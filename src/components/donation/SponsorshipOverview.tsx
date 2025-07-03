"use client";
import React, { useEffect, useState } from "react";

const SponsorshipOverview = () => {
  const [yatheemTotal, setYatheemTotal] = useState(0);
  const [sponsorYatheemTotal, setSponsorYatheemTotal] = useState(0);
  const [hafizTotal, setHafizTotal] = useState(0);
  const [sponsorHafizTotal, setSponsorHafizTotal] = useState(0);

  useEffect(() => {
    const fetchSponsorshipData = async () => {
      try {
        const response = await fetch("/api/find_total", {
          headers: {
            "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
          },
        });
        const data = await response.json();

        if (data.error) {
          console.error("Failed to fetch sponsorship data:", data.error);
          return;
        }

        setYatheemTotal(data.yatheemTotal || 0);
        setSponsorYatheemTotal(data.sponsorYatheemTotal || 0);
        setHafizTotal(data.hafizTotal || 0);
        setSponsorHafizTotal(data.sponsorHafizTotal || 0);
      } catch (error) {
        console.error("Error fetching sponsorship data:", error);
      }
    };

    fetchSponsorshipData();
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Sponsorship Overview</h3>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="space-y-4 w-full md:w-1/2">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm p-5 rounded-xl hover:bg-white/30 transition-all duration-300 shadow-lg">
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Yatheem Total</h4>
            <p className="text-lg font-bold text-brand-600 dark:text-white">
              ₹{yatheemTotal.toLocaleString()}
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm p-5 rounded-xl hover:bg-white/30 transition-all duration-300 shadow-lg">
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Hafiz Total</h4>
            <p className="text-lg font-bold text-brand-600 dark:text-white">
              ₹{hafizTotal.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="space-y-4 w-full md:w-1/2">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm p-5 rounded-xl hover:bg-white/30 transition-all duration-300 shadow-lg">
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Sponsor a Yatheem</h4>
            <p className="text-lg font-bold text-brand-600 dark:text-white">
              ₹{sponsorYatheemTotal.toLocaleString()}
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm p-5 rounded-xl hover:bg-white/30 transition-all duration-300 shadow-lg">
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Sponsor a Hafiz</h4>
            <p className="text-lg font-bold text-brand-600 dark:text-white">
              ₹{sponsorHafizTotal.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorshipOverview;