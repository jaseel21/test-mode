import type { Metadata } from "next";
import React from "react";

// Import custom components
import DonationMetrics from "@/components/donation/DonationMetrics";
import CampaignProgress from "@/components/donation/CampaignProgress";
import SponsorshipOverview from "@/components/donation/SponsorshipOverview";
import VolunteerActivity from "@/components/donation/VolunteerActivity";
// import RecentDonations from "@/components/donation/RecentDonations";
// import AgentPerformance from "@/components/donation/AgentPerformance";
import BarChart from "@/components/donation/BarChart";
import PieChart from "@/components/donation/PieChart";
import LineChart from "@/components/donation/LineChart";
import { AuthOptions, getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


export const metadata: Metadata = {
  title: "Donation App Dashboard | AIC Amal Donation App",
  description: "Dashboard for managing donations, campaigns, and volunteer activities.",
};

export default async function DonationDashboard() {
  // Mock Admin Name (Replace with actual dynamic data)


  const session = await getServerSession(authOptions as AuthOptions) 
  const adminName = session?.user?.name;
  
  

  return (
    
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        {/* Greeting Message */}
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Hey, <span className="text-blue-600 dark:text-yellow-400">{adminName}</span> 👋
        </h2>
        
        <span className="text-gray-500 dark:text-gray-300">
          Manage donations, campaigns & volunteers
        </span>
      </div>


      {/* Metrics & Charts Section */}
      <div className="grid grid-cols-12 gap-6">
        {/* Metrics Summary */}
        <div className="col-span-12 xl:col-span-8">
          <DonationMetrics />
        </div>

        {/* Campaign Progress */}
        <div className="col-span-12 xl:col-span-4">
          <CampaignProgress />
        </div>

        {/* Sponsorship Overview */}
        <div className="col-span-12 xl:col-span-6">
          <SponsorshipOverview />
        </div>

        {/* Volunteer Activity */}
        <div className="col-span-12 xl:col-span-6">
          <VolunteerActivity />
        </div>

        {/* Charts Row */}
        <div className="col-span-12 xl:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
          {/* <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Donations Overview</h3> */}
          <BarChart />
        </div>

        <div className="col-span-12 xl:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
          {/* <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Campaign Distribution</h3> */}
          <PieChart />
        </div>

        <div className="col-span-12 xl:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
          {/* <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Donations Trend</h3> */}
          <LineChart />
        </div>

        {/* Recent Donations */}
        {/* <div className="col-span-12 xl:col-span-6">
          <RecentDonations />
        </div> */}

        {/* Agent Performance */}
        {/* <div className="col-span-12 xl:col-span-6">
          <AgentPerformance />
        </div> */}
      </div>
    </div>
  );
}
