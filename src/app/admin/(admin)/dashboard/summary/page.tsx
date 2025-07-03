// src/app/(admin)/dashboard/summary/page.tsx
"use client";
import React from "react";
import DonationMetrics from "@/components/donation/DonationMetrics";
import CampaignProgress from "@/components/donation/CampaignProgress";
import SponsorshipOverview from "@/components/donation/SponsorshipOverview";
import VolunteerActivity from "@/components/donation/VolunteerActivity";

export default function SummaryPage() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Dashboard Summary</h2>
      <DonationMetrics />
      <CampaignProgress />
      <SponsorshipOverview />
      <VolunteerActivity />
    </div>
  );
}