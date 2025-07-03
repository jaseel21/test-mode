"use client";
import React, { useEffect, useState } from "react";

const VolunteerActivity = () => {
  const [totalVolunteers, setTotalVolunteers] = useState(0);
  const [totalBoxes, setTotalBoxes] = useState(0);

  useEffect(() => {
    const fetchVolunteerData = async () => {
      try {
        const response = await fetch("/api/find_total",
          {
            headers: {
              'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
            },
          }
        );
        const data = await response.json();

        if (data.error) {
          console.error("Failed to fetch volunteer data:", data.error);
          return;
        }

        setTotalVolunteers(data.totalVolunteers || 0);
        setTotalBoxes(data.totalBoxes || 0);
      } catch (error) {
        console.error("Error fetching volunteer data:", error);
      }
    };

    fetchVolunteerData();
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Volunteer Activity</h3>
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm p-5 rounded-xl hover:bg-white/30 transition-all duration-300 text-center shadow-lg">
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Volunteers</h4>
          <p className="text-2xl font-bold text-brand-600 dark:text-white">{totalVolunteers}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm p-5 rounded-xl hover:bg-white/30 transition-all duration-300 text-center shadow-lg">
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Boxes</h4>
          <p className="text-2xl font-bold text-brand-600 dark:text-white">{totalBoxes}</p>
        </div>
      </div>
    </div>
  );
};

export default VolunteerActivity;