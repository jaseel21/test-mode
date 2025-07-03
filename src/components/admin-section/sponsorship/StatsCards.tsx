import React from "react";
import { Users, Heart, DollarSign, Calculator } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalSponsors: number;
    totalAmount: number;
    yatheemSponsors: number;
    hafizSponsors: number;
  };
  isLoading: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, isLoading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sponsors</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                stats.totalSponsors
              )}
            </h3>
          </div>
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
            <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isLoading ? '...' : 'Total active sponsorships'}
          </p>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
              {isLoading ? (
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                formatCurrency(stats.totalAmount)
              )}
            </h3>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
            <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isLoading ? '...' : 'Cumulative sponsorship amount'}
          </p>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Yatheem Sponsors</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                stats.yatheemSponsors
              )}
            </h3>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
            <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isLoading ? '...' : 'Yatheem program sponsors'}
          </p>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Hafiz Sponsors</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                stats.hafizSponsors
              )}
            </h3>
          </div>
          <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
            <Calculator className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isLoading ? '...' : 'Hafiz program sponsors'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;