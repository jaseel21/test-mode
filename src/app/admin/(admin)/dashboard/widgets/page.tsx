// src/app/(admin)/dashboard/widgets/page.tsx
"use client";
import React from "react";
import BarChart from "@/components/donation/BarChart";
import PieChart from "@/components/donation/PieChart";
import LineChart from "@/components/donation/LineChart";

export default function WidgetsPage() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Dashboard Widgets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BarChart />
        <PieChart />
        <LineChart />
      </div>
    </div>
  );
}