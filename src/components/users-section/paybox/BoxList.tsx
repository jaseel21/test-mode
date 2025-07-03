"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import UserProfile from "./UserProfile";
import { Box, UserData } from "@/components/users-section/types";

interface BoxListProps {
  boxesData: Box[];
  userData: UserData;
  onBoxSelectEvent: (box: Box) => void;
  onEditProfile?: () => void;
}

const BoxList = ({ boxesData, userData, onBoxSelectEvent, onEditProfile }: BoxListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  console.log(boxesData);

  // Filter boxes based on search term
  const filteredBoxes = boxesData.filter((box) =>
    box.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total directly
  const total = filteredBoxes.reduce((sum, box) => {
    const amount = typeof box.totalAmount === "number" ? box.totalAmount : 0;
    return sum + amount;
  }, 0);

  // Status badge component
  const StatusBadge = ({ status }: { status: Box["status"] }) => {
    const colors = {
      active: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300",
      dead: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300",
      overdue: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300",
    };

    const labels = {
      active: "Active",
      dead: "Dead",
      overdue: "Overdue",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div>
      {/* User Profile Section */}
      <UserProfile userData={userData} onEditProfile={onEditProfile} totalAmount={total} />

      <h3 className="text-2xl font-bold text-indigo-900 dark:text-gray-100 mb-6">Your Pay-Boxes</h3>

      {/* Search box */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search by box serial number"
          className="w-full p-3 pl-10 border border-indigo-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <svg
          className="w-5 h-5 text-indigo-400 dark:text-indigo-300 absolute left-3 top-1/2 transform -translate-y-1/2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Summary section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-indigo-100 dark:border-gray-600 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Boxes</p>
              <p className="text-2xl font-bold text-indigo-900 dark:text-gray-100">{boxesData.length}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-indigo-600 dark:text-indigo-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-indigo-100 dark:border-gray-600 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Active Boxes</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {boxesData.filter((box) => box.status === "active").length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-indigo-100 dark:border-gray-600 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Overdue Boxes</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {boxesData.filter((box) => box.status === "overdue").length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Box list */}
      {filteredBoxes.length > 0 ? (
        <div className="space-y-6">
          {filteredBoxes.map((box) => (
            <motion.div
              key={box.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-5"
              onClick={() => onBoxSelectEvent(box)}
            >
              <div className="flex justify-between items-start">
                {/* Left Section: Box Details */}
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-indigo-800 dark:text-gray-200 mb-2">Box #{box.serialNumber}</h4>
                  <div className="space-y-1">
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      <span className="text-teal-600 dark:text-teal-400">Holder:</span> {box.name}
                    </p>
                    {box.status === "active" && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-teal-600 dark:text-teal-400">Last Payment:</span>{" "}
                          {new Date(box.lastPayment).toLocaleDateString()}
                        </p>
                        <div className="p-4 rounded-xl">
                          <p className="text-indigo-800 dark:text-gray-200 font-medium text-sm">Payment Status</p>
                          <p
                            className={`font-medium ${
                              box.paymentStatus === "Paid" ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
                            }`}
                          >
                            {box.paymentStatus} ({box.currentPeriod})
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Section: Status and Amount */}
                <div className="text-right space-y-2 min-w-[150px]">
                  <StatusBadge status={box.status} />
                  {box.status === "active" && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
                        Total Collection
                      </p>
                      <p className="text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-teal-500 dark:from-indigo-500 dark:to-teal-400 px-4 py-2 rounded-lg shadow-md mt-1">
                        ₹{box.totalAmount}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <svg
            className="w-12 h-12 text-gray-400 dark:text-gray-300 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">No Pay-Boxes found</p>
          {searchTerm && (
            <button
              className="text-indigo-600 dark:text-indigo-300 font-medium mt-2 hover:text-indigo-800 dark:hover:text-indigo-200"
              onClick={() => setSearchTerm("")}
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BoxList;