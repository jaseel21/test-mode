import React from "react";
import { X, User, Calendar, DollarSign, MapPin, Phone, Hash, Clock, CreditCard } from "lucide-react";
import { Sponsorship } from "@/app/admin/(admin)/sponsorships/list/page";

interface SponsorshipDetailModalProps {
  isOpen: boolean;
  sponsorship: Sponsorship | null;
  onClose: () => void;
}

const SponsorshipDetailModal: React.FC<SponsorshipDetailModalProps> = ({
  isOpen,
  sponsorship,
  onClose,
}) => {
  if (!isOpen || !sponsorship) return null;

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  // Get program type display (without "Sponsor-" prefix)
  const getProgramType = (type: string) => {
    return type.replace('Sponsor-', '');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full shadow-2xl overflow-hidden">
        {/* Header with close button */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 px-6 py-4 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Sponsorship Details</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(100vh-10rem)]">
          {/* Payment Information */}
          <div className="bg-white/5 dark:bg-gray-700/30 backdrop-blur-md rounded-xl p-5 border border-white/10 mb-6">
            <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-emerald-500" /> Payment Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatAmount(sponsorship.amount)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Payment Date</p>
                <p className="text-base text-gray-800 dark:text-white mt-1 flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  {formatDate(sponsorship.paymentDate)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Razorpay Payment ID</p>
                <p className="text-base text-gray-800 dark:text-white mt-1 font-mono">
                  {sponsorship.razorpayPaymentId}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Razorpay Order ID</p>
                <p className="text-base text-gray-800 dark:text-white mt-1 font-mono">
                  {sponsorship.razorpayOrderId}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium
                    ${sponsorship.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 
                      sponsorship.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'}`}>
                    {sponsorship.status.charAt(0).toUpperCase() + sponsorship.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                <p className="text-base text-gray-800 dark:text-white mt-1 flex items-center">
                  <CreditCard className="h-4 w-4 mr-1 text-gray-400" />
                  UPI/Online Payment
                </p>
              </div>
            </div>
          </div>
          
          {/* Sponsorship Details */}
          <div className="bg-white/5 dark:bg-gray-700/30 backdrop-blur-md rounded-xl p-5 border border-white/10 mb-6">
            <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" /> Sponsorship Details
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Program Type</p>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium 
                    ${sponsorship.type === 'Sponsor-Yatheem' ? 
                      'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400' : 
                      'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400'}`}>
                    {getProgramType(sponsorship.type)}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Program</p>
                <p className="text-base text-gray-800 dark:text-white mt-1">
                  {sponsorship.program}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sponsorship Period</p>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium 
                    ${sponsorship.period === 'Monthly' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' : 
                      sponsorship.period === 'Quarterly' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400' :
                      'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'}`}>
                    {sponsorship.period}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Recurrence</p>
                <p className="text-base text-gray-800 dark:text-white mt-1">
                  {sponsorship.period === 'Monthly' ? 'Every Month' : 
                   sponsorship.period === 'Quarterly' ? 'Every 3 Months' : 'Every Year'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Donor Information */}
          <div className="bg-white/5 dark:bg-gray-700/30 backdrop-blur-md rounded-xl p-5 border border-white/10 mb-6">
            <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-purple-500" /> Donor Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="text-base font-semibold text-gray-800 dark:text-white mt-1">
                  {sponsorship.name}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-base text-gray-800 dark:text-white mt-1 flex items-center">
                  <Phone className="h-4 w-4 mr-1 text-gray-400" />
                  {sponsorship.phone}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
                <p className="text-base text-gray-800 dark:text-white mt-1 flex items-center">
                  <Hash className="h-4 w-4 mr-1 text-gray-400" />
                  {sponsorship.userId}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                <p className="text-base text-gray-800 dark:text-white mt-1 flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                  {sponsorship.district}, {sponsorship.panchayat}
                </p>
              </div>
            </div>
          </div>
          
          {/* Signature Information (if needed) */}
          <div className="bg-white/5 dark:bg-gray-700/30 backdrop-blur-md rounded-xl p-5 border border-white/10">
            <div className="flex justify-between items-start">
              <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
                <Hash className="h-5 w-5 mr-2 text-gray-500" /> Transaction Signature
              </h4>
              <button className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                Copy
              </button>
            </div>
            <p className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
              {sponsorship.razorpaySignature}
            </p>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SponsorshipDetailModal;