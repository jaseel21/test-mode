import Image from "next/image";
import { motion } from "framer-motion";
import { Campaign } from "../types";

interface CampaignCardProps {
  campaign: Campaign;
  isActive: boolean;
  onClick: (id: number) => void;
}

export function CampaignCard({ campaign, isActive, onClick }: CampaignCardProps) {
  const getPercentage = (raised: number, goal: number, isInfinite: boolean) =>
    isInfinite ? Math.round((raised / goal) * 100) : Math.min(Math.round((raised / goal) * 100), 100);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "fundraising":
        return "Fundraising";
      case "physical":
        return "Physical Drive";
      case "fixedamount":
        return "Fixed Amount";
      default:
        return "Campaign";
    }
  };

  const getRaisedLabel = (type: string, raised: number) => {
    return type === "physical" ? `${raised.toLocaleString()} items` : `₹${raised.toLocaleString()}`;
  };
  
  const getGoalLabel = (type: string, goal: number | null | undefined, isInfinite: boolean) => {
    if (isInfinite) {
      return type === "physical" ? "Infinite Items" : "Infinite Amount";
    } else {
      if (goal === undefined || goal === null) {
        return "No Goal Set";
      }
      return type === "physical" 
        ? `${goal.toLocaleString()} items` 
        : `₹${goal.toLocaleString()}`;
    }
  };

  return (
    <motion.div
      variants={{
        hidden: { y: 30, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 70, damping: 12 } },
      }}
      className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${isActive ? "ring-2 ring-purple-400 dark:ring-purple-600" : ""} group`}
    >
      <div className="relative h-56 w-full">
        <Image
          src={campaign.featuredImageUrl || "/api/placeholder/800/400"}
          alt={campaign.title}
          className="object-cover transition-transform duration-700 group-hover:scale-105 brightness-95 group-hover:brightness-100"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={isActive}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-4 right-4 z-30">
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium shadow-md backdrop-blur-sm ${
              campaign.type === "fundraising"
                ? "bg-purple-900/90 text-white dark:bg-purple-700/90"
                : campaign.type === "physical"
                ? "bg-indigo-900/90 text-white dark:bg-indigo-700/90"
                : "bg-green-900/90 text-white dark:bg-green-700/90"
            }`}
          >
            {getTypeLabel(campaign.type)}
          </div>
        </div>
        <div className="absolute top-4 left-4 z-30">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-md flex items-center">
            <svg className="w-3 h-3 mr-1 text-purple-900 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium text-purple-900 dark:text-purple-300">Ends: {formatDate(campaign.endDate)}</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-30 p-6">
          <h3 className="text-xl font-bold text-white drop-shadow-md">{campaign.title}</h3>
        </div>
      </div>

      <div className="relative z-30 -mt-5 mx-4">
        <div
          className={`bg-white dark:bg-gray-800 rounded-lg px-4 py-3 shadow-md border ${
            campaign.type === "fundraising" ? "border-purple-200 dark:border-purple-700" : campaign.type === "physical" ? "border-indigo-200 dark:border-indigo-700" : "border-green-200 dark:border-green-700"
          }`}
        >
          <div className="flex justify-between text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400">Raised</span>
              <span className="text-base font-bold text-gray-900 dark:text-gray-100">{getRaisedLabel(campaign.type, campaign.raised)}</span>
            </div>
            
            <div className="text-right flex flex-col">
              <span className="text-gray-500 dark:text-gray-400">Goal</span>
              <span className="text-base font-bold text-gray-900 dark:text-gray-100">{getGoalLabel(campaign.type, campaign.goal, campaign.isInfinite)}</span>
            </div>
          </div>
          
          {!campaign.isInfinite===true &&
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${getPercentage(campaign.raised, campaign.goal, campaign.isInfinite)}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-full rounded-full ${
                campaign.type === "fundraising"
                  ? "bg-gradient-to-r from-purple-600 to-purple-400 dark:from-purple-500 dark:to-purple-300"
                  : campaign.type === "physical"
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-indigo-500 dark:to-indigo-300"
                  : "bg-gradient-to-r from-green-600 to-green-400 dark:from-green-500 dark:to-green-300"
              }`}
            />
          </div>
          }
          {campaign.isInfinite===false &&
          <div className="mt-1 text-xs text-right font-medium text-gray-500 dark:text-gray-400">
            {getPercentage(campaign.raised, campaign.goal, campaign.isInfinite)}% Complete
          </div>
          
          }
          {campaign.type === "fixedamount" && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Fixed: {campaign.area} @ ₹{campaign.rate?.toLocaleString()}/unit
            </div>
          )}
        </div>
      </div>

      <div className="p-6 pt-4">
        <p className="text-gray-700 dark:text-gray-300 mb-5 text-sm">{campaign.description}</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onClick(campaign.id)}
          className={`w-full py-3 rounded-lg text-white shadow-sm hover:shadow-md transition-all ${
            campaign.type === "fundraising"
              ? "bg-gradient-to-r from-purple-700 to-purple-600 dark:from-purple-600 dark:to-purple-500"
              : campaign.type === "physical"
              ? "bg-gradient-to-r from-indigo-700 to-indigo-600 dark:from-indigo-600 dark:to-indigo-500"
              : "bg-gradient-to-r from-green-700 to-green-600 dark:from-green-600 dark:to-green-500"
          }`}
        >
          {campaign.type === "fundraising" ? "Donate Now" : campaign.type === "physical" ? "Join Initiative" : "Support Now"}
        </motion.button>
      </div>
    </motion.div>
  );
}