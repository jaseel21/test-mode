// src/app/(admin)/settings/roles/page.tsx
"use client";
import React from "react";

export default function RolePermissionsPage() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Role Permissions</h2>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
        {/* Define roles and permissions */}
        <p className="text-gray-600 dark:text-gray-300">Define roles and permissions will be displayed here.</p>
      </div>
    </div>
  );
}