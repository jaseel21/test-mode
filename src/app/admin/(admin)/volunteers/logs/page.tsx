// src/app/(admin)/volunteers/logs/page.tsx
"use client";
import React from "react";

export default function ViewLogsPage() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">View Volunteer Logs</h2>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
        {/* View volunteer activity logs */}
        <p className="text-gray-600 dark:text-gray-300">View volunteer activity logs will be displayed here.</p>
      </div>
    </div>
  );
}