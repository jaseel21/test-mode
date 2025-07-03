"use client";
import React from "react";

const AgentPerformance = () => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Agent Performance</h3>
      <div className="space-y-4">

        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm p-5 rounded-xl shadow-lg hover:bg-white/30 transition-all duration-300">
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Agent: Agent 1</h4>
          <p className="text-lg font-bold text-brand-600 dark:text-white">₹10,000</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm p-5 rounded-xl shadow-lg hover:bg-white/30 transition-all duration-300">
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Agent: Agent 2</h4>
          <p className="text-lg font-bold text-brand-600 dark:text-white">₹8,000</p>
        </div>

      </div>
    </div>
  );
};

export default AgentPerformance;
