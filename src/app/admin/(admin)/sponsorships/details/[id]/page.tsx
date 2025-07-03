"use client";

import React, { useState, useEffect, useCallback } from "react"; // Add useCallback
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Hash,
  Clock,
  CreditCard,
  Printer,
  Download,
  Edit,
  Trash2,
  Loader2,
  Copy,
  Check
} from "lucide-react";
import { Sponsorship } from "@/app/admin/(admin)/sponsorships/list/page";
import DeleteConfirmModal from "@/components/admin-section/sponsorship/DeleteConfirmModal";

export default function SponsorshipDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [sponsorship, setSponsorship] = useState<Sponsorship | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Memoize fetchSponsorshipDetails to prevent unnecessary re-creation
  const fetchSponsorshipDetails = useCallback(async () => {
    if (!id) return; // Guard against invalid id

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/sponsorships/${id}`, {
        headers: {
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch sponsorship details');
      }

      const data = await response.json();
      setSponsorship(data);
    } catch (error) {
      console.error('Error fetching sponsorship details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]); // Depend on id to re-fetch if it changes

  useEffect(() => {
    if (id) {
      fetchSponsorshipDetails();
    }
  }, [id, fetchSponsorshipDetails]); // Include fetchSponsorshipDetails in dependencies

  const handleDeleteConfirm = async () => {
    if (!sponsorship) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/sponsorships/${sponsorship._id}`, {
        method: 'DELETE',
        headers: {
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete sponsorship');
      }

      // Redirect back to the main page after deletion
      router.push('/admin/sponsorships');
    } catch (error) {
      console.error('Error deleting sponsorship:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

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

  // Determine payment method based on paymentId
  const getPaymentMethod = (paymentId: string, defaultMethod: string = 'Online Payment') => {
    if (!paymentId) return defaultMethod;

    if (paymentId === 'OFFLINE_PAYMENT') {
      return 'Cash';
    } else if (paymentId.startsWith('CHECK-')) {
      return 'Check';
    } else if (paymentId.startsWith('BANK-')) {
      return 'Bank Transfer';
    } else if (paymentId.startsWith('UPI-')) {
      return 'UPI';
    } else if (sponsorship?.razorpayOrderId?.startsWith('MANUAL-')) {
      return 'Manual Entry';
    }

    return defaultMethod;
  };

  // Get payment method style based on method
  const getPaymentMethodStyle = (method: string): string => {
    const methodStyles: Record<string, string> = {
      'Cash': "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      'Offline Payment': "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      'Check': "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      'Bank Transfer': "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      'UPI': "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      'Manual Entry': "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
      'Online Payment': "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
    };

    return methodStyles[method] || "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 mt-4">Loading sponsorship details...</p>
        </div>
      </div>
    );
  }

  if (!sponsorship) {
    return (
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <Link
            href="/admin/sponsorships"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Sponsorships
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Sponsorship Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">The sponsorship you&apos;re looking for doesn&apos;t exist or was deleted.</p>
          <Link
            href="/admin/sponsorships"
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300"
          >
            Return to Sponsorships
          </Link>
        </div>
      </div>
    );
  }

  // Determine payment method based on razorpayPaymentId
  const paymentMethod = getPaymentMethod(sponsorship.razorpayPaymentId, 'Online Payment');

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Back link */}
      <div className="flex justify-between items-center">
        <Link
          href="/admin/sponsorships/list/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Sponsorships
        </Link>

        <div className="flex gap-2">
          <button
            className="px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4 mr-2" /> Print
          </button>
          <button
            className="px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" /> Export PDF
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white flex items-center">
              Sponsorship Details
              <span className="ml-3 text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-gray-500 dark:text-gray-400 font-normal">
                ID: {sponsorship._id}
              </span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {formatDate(sponsorship.createdAt)}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium
              ${sponsorship.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                sponsorship.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400' :
                'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'}`}>
              {sponsorship.status.charAt(0).toUpperCase() + sponsorship.status.slice(1)}
            </div>

            <div className={`px-3 py-1 rounded-full text-sm font-medium
              ${sponsorship.type === 'Sponsor-Yatheem' ?
                'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400' :
                'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400'}`}>
              {getProgramType(sponsorship.type)}
            </div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donor Information */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-white/10 flex items-center">
            <User className="h-5 w-5 mr-2 text-purple-500" /> Donor Information
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Name</h4>
              <p className="text-lg font-bold text-gray-800 dark:text-white">{sponsorship.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Phone</h4>
              <p className="text-base text-gray-800 dark:text-white flex items-center">
                <Phone className="h-4 w-4 mr-1 text-gray-400" />
                {sponsorship.phone}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Email</h4>
              <p className="text-base text-gray-800 dark:text-white flex items-center">
                {sponsorship.email || 'N/A'}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">User ID</h4>
              <p className="text-base text-gray-800 dark:text-white flex items-center">
                <Hash className="h-4 w-4 mr-1 text-gray-400" />
                {sponsorship.userId || 'N/A'} {/* Handle undefined userId */}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Location</h4>
              <p className="text-base text-gray-800 dark:text-white flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                {sponsorship.district}, {sponsorship.panchayat}
              </p>
            </div>
          </div>
        </div>

        {/* Sponsorship Details */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-white/10 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" /> Sponsorship Details
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Amount</h4>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatAmount(Number(sponsorship.amount))}</p> {/* Convert string to number */}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Type</h4>
              <div className="mt-1">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium
                  ${sponsorship.type === 'Sponsor-Yatheem' ?
                    'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400' :
                    'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400'}`}>
                  {getProgramType(sponsorship.type)}
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Period</h4>
              <div className="mt-1">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium
                  ${sponsorship.period === 'Monthly' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                    sponsorship.period === 'Quarterly' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400' :
                    'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'}`}>
                  {sponsorship.period}
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Date & Time</h4>
              <p className="text-base text-gray-800 dark:text-white flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gray-400" />
                {formatDate(sponsorship.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-white/10 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-emerald-500" /> Payment Information
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Status</h4>
              <div className="mt-1">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium
                  ${sponsorship.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                    sponsorship.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400' :
                    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'}`}>
                  {sponsorship.status.charAt(0).toUpperCase() + sponsorship.status.slice(1)}
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Payment Method</h4>
              <p className="text-base text-gray-800 dark:text-white flex items-center mt-1">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPaymentMethodStyle(paymentMethod)}`}>
                  <CreditCard className="h-4 w-4 inline mr-1 text-current" />
                  {paymentMethod}
                </span>
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Transaction ID</h4>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono text-gray-800 dark:text-white">{sponsorship.razorpayPaymentId || 'N/A'}</p> {/* Handle undefined */}
                <button
                  onClick={() => {
                    if (sponsorship.razorpayPaymentId) {
                      navigator.clipboard.writeText(sponsorship.razorpayPaymentId);
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    }
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Copy transaction ID"
                  disabled={!sponsorship.razorpayPaymentId}
                >
                  {copySuccess ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                </button>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Order ID</h4>
              <p className="text-sm font-mono text-gray-800 dark:text-white">{sponsorship.razorpayOrderId || 'N/A'}</p> {/* Handle undefined */}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Payment Date</h4>
              <p className="text-base text-gray-800 dark:text-white">
                {sponsorship.paymentDate ? formatDate(sponsorship.paymentDate) : formatDate(sponsorship.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Signature */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <Hash className="h-5 w-5 mr-2 text-gray-500" /> Transaction Signature
          </h3>
          <button
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 bg-white/5 dark:bg-gray-800/50 px-2 py-1 rounded-md"
            onClick={() => {
              if (sponsorship.razorpaySignature) {
                navigator.clipboard.writeText(sponsorship.razorpaySignature);
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
              }
            }}
            disabled={!sponsorship.razorpaySignature}
          >
            {copySuccess ? "Copied!" : "Copy to Clipboard"}
          </button>
        </div>
        <div className="bg-white/5 dark:bg-gray-800/30 p-4 rounded-lg">
          <p className="text-xs font-mono overflow-x-auto text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
            {sponsorship.razorpaySignature || 'N/A'} {/* Handle undefined */}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-white/10">
          Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href={`/admin/sponsorships/edit/${sponsorship._id}`}
            className="px-4 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-all duration-300 flex items-center justify-center"
          >
            <Edit className="h-4 w-4 mr-2" /> Edit Sponsorship
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800/50 transition-all duration-300 flex items-center justify-center"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete Sponsorship
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        isDeleting={isDeleting}
        sponsorship={sponsorship}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}