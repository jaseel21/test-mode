// src/app/(admin)/receipts/download/page.tsx
"use client";
import React from "react";

export default function DownloadReceiptsPage() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Download Receipts</h2>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
        {/* Form to download receipts */}
        <p className="text-gray-600 dark:text-gray-300">Form to download receipts will be displayed here.</p>
      </div>
    </div>
  );
}