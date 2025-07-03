"use client";

import { useEffect, useState } from "react";
import Head from "next/head";

const CampaignProgress = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await fetch("/api/list-recent-donations", {
          headers: {
            "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
          },
        });
        const data = await response.json();
        if (data.success) {
          setDonations(data.donations);
        } else {
          setError("Failed to fetch donations");
        }
      } catch (err) {
        setError("An error occurred while fetching donations");
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Donations</h3>

      <main className="w-full max-w-6xl">
        {/* Loading State */}
        {loading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading donations...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100/50 dark:bg-red-900/20 border border-red-400/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && donations.length === 0 && (
          <p className="text-center text-gray-600 dark:text-gray-400">
            No donations found.
          </p>
        )}

        {/* Donation Cards */}
        {!loading && !error && donations.length > 0 && (
          <div className="space-y-2 overflow-y-auto">
            {donations.slice(0, 3).map((donation) => (
              <div
                key={donation._id}
                className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-300 text-center shadow-lg"
              >
                <div className="flex items-center p-2">
                  <div className="w-1 h-10 bg-gradient-to-b from-emerald-400 to-green-500 rounded-full mr-3"></div>

                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-gray-800 dark:text-white truncate">
                        {donation.name || "Anonymous"}
                      </h4>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 ml-2">
                        ₹{donation.amount}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(donation.createdAt).toLocaleString("en-US", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </p>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          donation.status === "Completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                        }`}
                      >
                        {donation.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CampaignProgress;