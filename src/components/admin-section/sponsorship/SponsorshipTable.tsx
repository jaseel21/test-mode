import React from "react";
import { ArrowUpDown, Eye, Edit, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { Sponsorship } from "@/app/admin/(admin)/sponsorships/list/page";

interface SponsorshipTableProps {
  sponsorships: Sponsorship[];
  isLoading: boolean;
  onEdit: (sponsorship: Sponsorship) => void;
  onDelete: (sponsorship: Sponsorship) => void;
  onViewDetails: (sponsorship: Sponsorship) => void;
  toggleSort: (column: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const SponsorshipTable: React.FC<SponsorshipTableProps> = ({
  sponsorships,
  isLoading,
  onEdit,
  onDelete,
  toggleSort,
  sortBy,
}) => {
  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format amount with currency
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Render type badge
  const TypeBadge = ({ type }: { type: string }) => {
    let bgColor = "bg-blue-500/20 text-blue-500";
    
    if (type === "Sponsor-Yatheem") {
      bgColor = "bg-purple-500/20 text-purple-500";
    } else if (type === "Sponsor-Hafiz") {
      bgColor = "bg-indigo-500/20 text-indigo-500";
    }

    // Display friendly name without "Sponsor-" prefix
    const displayType = type.replace('Sponsor-', '');

    return (
      <span className={`px-2 py-1 rounded-full ${bgColor} text-xs font-medium`}>
        {displayType}
      </span>
    );
  };

  // Render period badge
  const PeriodBadge = ({ period }: { period: string }) => {
    let bgColor = "bg-gray-500/20 text-gray-500";
    
    if (period === "1 Month") {
      bgColor = "bg-emerald-500/20 text-emerald-500";
    } else if (period === "1 Month(with education)") {
      bgColor = "bg-amber-500/20 text-amber-500";
    } else if (period === "6 Months") {
      bgColor = "bg-amber-500/20 text-amber-500";
    } else if (period === "6 Months(with education)") {
      bgColor = "bg-amber-500/20 text-amber-500";
    } else if (period === "One Year") {
      bgColor = "bg-blue-500/20 text-blue-500";
    } else if (period === "One Year(with education)") {
      bgColor = "bg-blue-500/20 text-blue-500";
    }


    return (
      <span className={`px-2 py-1 rounded-full ${bgColor} text-xs font-medium`}>
        {period}
      </span>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
          <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-emerald-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  // Empty state
  if (sponsorships.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6">
          <Users className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No sponsorships found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      {/* Desktop Table */}
      <table className="hidden md:table w-full text-left border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="sticky top-0 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-md p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-tl-lg">
              <div
                className="flex items-center cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => toggleSort('name')}
              >
                Donor Name
                <ArrowUpDown className={`ml-1 h-4 w-4 ${sortBy === 'name' ? 'text-emerald-500' : ''}`} />
              </div>
            </th>
            <th className="sticky top-0 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-md p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <div
                className="flex items-center cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => toggleSort('amount')}
              >
                Amount
                <ArrowUpDown className={`ml-1 h-4 w-4 ${sortBy === 'amount' ? 'text-emerald-500' : ''}`} />
              </div>
            </th>
            <th className="sticky top-0 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-md p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Type
            </th>
            <th className="sticky top-0 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-md p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Period
            </th>
            <th className="sticky top-0 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-md p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              District
            </th>
            <th className="sticky top-0 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-md p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <div
                className="flex items-center cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => toggleSort('createdAt')}
              >
                Date
                <ArrowUpDown className={`ml-1 h-4 w-4 ${sortBy === 'createdAt' ? 'text-emerald-500' : ''}`} />
              </div>
            </th>
            <th className="sticky top-0 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-md p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-tr-lg">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sponsorships.map((sponsorship, index) => (
            <tr
              key={sponsorship._id}
              className={`hover:bg-white/5 dark:hover:bg-gray-800/50 backdrop-blur-md transition-all group ${index % 2 === 0 ? 'bg-white/2' : 'bg-white/5 dark:bg-gray-800/20'}`}
            >
              <td className="p-3 text-sm font-medium text-gray-900 dark:text-white border-b border-white/10">
                <div className="flex flex-col">
                  <span>{sponsorship.name}</span>
                  <span className="text-xs text-gray-500">{sponsorship.phone}</span>
                </div>
              </td>
              <td className="p-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 border-b border-white/10">
                {formatAmount(sponsorship.amount)}
              </td>
              <td className="p-3 border-b border-white/10">
                <TypeBadge type={sponsorship.type} />
              </td>
              <td className="p-3 border-b border-white/10">
                <PeriodBadge period={sponsorship.period} />
              </td>
              <td className="p-3 text-sm text-gray-700 dark:text-gray-300 border-b border-white/10">
                {sponsorship.district}
              </td>
              <td className="p-3 text-sm text-gray-500 dark:text-gray-400 border-b border-white/10">
              {formatDate(sponsorship.createdAt)}
              </td>
              <td className="p-3 border-b border-white/10">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                  <Link
                    href={`/admin/sponsorships/details/${sponsorship._id}`}
                    className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/admin/sponsorships/edit/${sponsorship._id}`}
                    className="p-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => onDelete(sponsorship)}
                    className="p-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-3">
        {sponsorships.map((sponsorship) => (
          <div
            key={sponsorship._id}
            className="p-4 bg-white/5 dark:bg-gray-800/20 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-sm font-bold text-gray-800 dark:text-white mb-1">
                  {sponsorship.name}
                </div>
                <div className="text-xs text-gray-500">{sponsorship.phone}</div>
              </div>
              <TypeBadge type={sponsorship.type} />
            </div>

            <div className="flex items-center justify-between mt-3">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Amount</div>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {formatAmount(sponsorship.amount)}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Period</div>
                <PeriodBadge period={sponsorship.period} />
              </div>

              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Date</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {formatDate(sponsorship.createdAt)}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {sponsorship.district}
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/admin/sponsorships/details/${sponsorship._id}`}
                  className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => onEdit(sponsorship)}
                  className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(sponsorship)}
                  className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SponsorshipTable;