// src/app/admin/(admin)/donations/detail/page.tsx
"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Share2,
  Trash2,
  MessageSquare,
  Check,
  AlertCircle,
  Copy,
  Clock,
  CheckCircle,
  XCircle,
  Edit
} from "lucide-react";

// Define types for donation data
interface Donor {
  name: string;
  email: string;
  phone: string;
  district: string;
  location: string;
  locationType: string;
  address: string;
  previousDonations: number;
  totalAmount: string;
}

interface Donation {
  amount: string;
  type: string;
  status: string;
  date: string;
  time: string;
  paymentMethod: string;
  transactionId: string;
  purpose: string;
}

interface Recipient {
  name: string;
  institution: string;
  program: string;
}

interface DonationData {
  id: string;
  _id: string;
  donor: Donor;
  donation: Donation;
  recipient: Recipient;
}

// Loading component
function LoadingComponent() {
  return (
    <div className="p-6 flex justify-center items-center min-h-[400px]">
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
        <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-emerald-500 animate-spin"></div>
      </div>
    </div>
  );
}

// Main content component
function DonationDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const donationId = searchParams.get('id');

  const [isLoading, setIsLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [donationData, setDonationData] = useState<DonationData>({
    id: '',
    _id: '',
    donor: {
      name: '',
      email: '',
      phone: '',
      district: '',
      location: '',
      locationType: '',
      address: '',
      previousDonations: 0,
      totalAmount: '₹0'
    },
    donation: {
      amount: '',
      type: '',
      status: '',
      date: '',
      time: '',
      paymentMethod: '',
      transactionId: '',
      purpose: ''
    },
    recipient: {
      name: '',
      institution: '',
      program: ''
    }
  });

  // State for UI interactions
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageError, setMessageError] = useState("");
  const [messageSuccess, setMessageSuccess] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  // Define allowed payment method types
  type PaymentMethod =
    | 'Cash'
    | 'Offline Payment'
    | 'Check'
    | 'Bank Transfer'
    | 'UPI'
    | 'Manual Entry'
    | string;

  // Status badge component with explicit type
  const StatusBadge = ({ status }: { status: string }) => {
    let bgColor = "bg-gray-500/20 text-gray-500";
    let icon = <AlertCircle className="h-4 w-4 mr-1" />;

    switch (status) {
      case "Completed":
        bgColor = "bg-green-500/20 text-green-500";
        icon = <CheckCircle className="h-4 w-4 mr-1" />;
        break;
      case "Pending":
        bgColor = "bg-amber-500/20 text-amber-500";
        icon = <Clock className="h-4 w-4 mr-1" />;
        break;
      case "Failed":
        bgColor = "bg-red-500/20 text-red-500";
        icon = <XCircle className="h-4 w-4 mr-1" />;
        break;
    }

    return (
      <span className={`px-2 py-1 rounded-full ${bgColor} flex items-center justify-center w-fit text-xs font-medium`}>
        {icon} {status}
      </span>
    );
  };

  // Payment method style with proper typing
  const getPaymentMethodStyle = (method: PaymentMethod): string => {
    if (!method) return "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300";

    const methodStyles: Record<PaymentMethod, string> = {
      'Cash': "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      'Offline Payment': "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      'Check': "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      'Bank Transfer': "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      'UPI': "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      'Manual Entry': "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
    };

    return methodStyles[method] || "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300";
  };

  // Fetch donation data
  useEffect(() => {
    if (!donationId) return;

    const fetchDonationData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/donations/dashboard/donations/${donationId}`,
          {
            headers: {
              'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
            },
          }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch donation');
        }

        const donation = await response.json();

        let paymentMethod: PaymentMethod = 'Online Payment';
        if (donation.razorpayPaymentId === 'OFFLINE_PAYMENT') {
          paymentMethod = 'Cash';
        } else if (donation.razorpayPaymentId?.startsWith('CHECK-')) {
          paymentMethod = 'Check';
        } else if (donation.razorpayPaymentId?.startsWith('BANK-')) {
          paymentMethod = 'Bank Transfer';
        } else if (donation.razorpayPaymentId?.startsWith('UPI-')) {
          paymentMethod = 'UPI';
        } else if (donation.razorpayOrderId?.startsWith('MANUAL-')) {
          paymentMethod = 'Manual Entry';
        }

        setDonationData({
          id: donation.id || '',
          _id: donation._id || '',
          donor: {
            name: donation.donor || '',
            email: donation.email || 'N/A',
            phone: donation.phone || 'N/A',
            district: donation.donor_details?.district || 'N/A',
            location: donation.donor_details?.location || 'N/A',
            locationType: donation.donor_details?.locationType || 'N/A',
            address: donation.donor_details?.address || 'N/A',
            previousDonations: 0,
            totalAmount: '₹0'
          },
          donation: {
            amount: donation.amount || '',
            type: donation.type || '',
            status: donation.status || '',
            date: donation.date ? new Date(donation.date).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }) : '',
            time: donation.createdAtTimestamp ? new Date(donation.createdAtTimestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            }) : '',
            paymentMethod: donation.paymentMethod || paymentMethod,
            transactionId: donation.transactionId || 'N/A',
            purpose: `${donation.type || ''} Donation`
          },
          recipient: {
            name: donation.type === 'Yatheem' ? 'Yatheem Program' : 'General Fund',
            institution: 'Akode Islamic Centre',
            program: donation.type === 'Yatheem' ? 'Yatheem Sponsorship Program' :
              donation.type === 'Hafiz' ? 'Hafiz Sponsorship Program' :
                donation.type === 'Building' ? 'Building Fund' :
                  'General Donation Program'
          }
        });

        setMessageText(`Dear ${donation.donor || 'Donor'},\n\nThank you for your generous donation of ${donation.amount} to our ${donation.type || 'organization'} fund. Your contribution makes a significant impact on our mission.\n\nDonation ID: ${donation.id}\nDate: ${new Date(donation.date).toLocaleDateString()}\n\nWith gratitude,\nAkode Islamic Centre Team`);
      } catch (error) {
        console.error('Error fetching donation:', error instanceof Error ? error.message : String(error));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonationData();
  }, [donationId]);

  const downloadReceipt = async () => {
    setIsGeneratingReceipt(true);
    try {
      const response = await fetch(`/api/donations/dashboard/donations/${donationId}/receipt`, {
        method: 'POST',
        headers: {
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate receipt');
      }

      const htmlContent = await response.text();
      const receiptWindow = window.open('', '_blank');
      if (!receiptWindow) {
        alert('Please allow popups to view and download the receipt');
        setIsGeneratingReceipt(false);
        return;
      }

      receiptWindow.document.write(htmlContent);
      receiptWindow.document.close();
    } catch (error) {
      console.error('Error generating receipt:', error instanceof Error ? error.message : String(error));
      alert('Failed to generate receipt. Please try again.');
    } finally {
      setIsGeneratingReceipt(false);
    }
  };

  const sendMessageToDonor = async () => {
    if (!messageText.trim()) {
      setMessageError("Message cannot be empty");
      return;
    }

    setIsSendingMessage(true);
    setMessageError("");
    setMessageSuccess("");

    try {
      const response = await fetch(`/api/donations/dashboard/donations/${donationId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
        body: JSON.stringify({
          message: messageText,
          phone: donationData.donor.phone
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      setMessageSuccess("Message sent successfully!");
      setTimeout(() => {
        setShowMessageModal(false);
        setMessageSuccess("");
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error instanceof Error ? error.message : String(error));
      setMessageError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const deleteDonation = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/donations/dashboard/donations/${donationId}`, {
        method: 'DELETE',
        headers: {
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete donation');
      }

      router.push('/admin/donations/all');
    } catch (error) {
      console.error('Error deleting donation:', error instanceof Error ? error.message : String(error));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const copyReceiptText = () => {
    const receiptText = `
Receipt from Akode Islamic Centre
=================================
Donation ID: ${donationData.id}
Donor: ${donationData.donor.name}
Amount: ${donationData.donation.amount}
Type: ${donationData.donation.type}
Date: ${donationData.donation.date}
Status: ${donationData.donation.status}
=================================
Thank you for your generous contribution!
    `.trim();

    navigator.clipboard.writeText(receiptText)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy receipt:', err instanceof Error ? err.message : String(err));
      });
  };

  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            Donation Details <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">#{donationData.id}</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View complete information about this donation
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/donations/all"
            className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Donations
          </Link>
          <button
            onClick={() => setShowReceipt(!showReceipt)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300"
          >
            {showReceipt ? "Hide Receipt" : "View Receipt"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-white/10">
            Donor Information
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Name</h4>
              <p className="text-lg font-bold text-gray-800 dark:text-white">{donationData.donor.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Contact</h4>
              <p className="text-base text-gray-800 dark:text-white">Phone: {donationData.donor.phone}</p>
              <div className="flex flex-row">
                <p className="text-base text-gray-800 dark:text-white">Email: ‎</p>
                <p className="text-base text-blue-600 dark:text-blue-400 hover:underline">
                  <a href={`mailto:${donationData.donor.email}`}>{donationData.donor.email}</a>
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Location Details</h4>
              <div className="space-y-1">
                <p className="text-base text-gray-800 dark:text-white">
                  <span className="font-medium">District:</span> {donationData.donor.district}
                </p>
                <p className="text-base text-gray-800 dark:text-white">
                  <span className="font-medium">Location:</span> {donationData.donor.location}
                </p>
                {donationData.donor.address !== 'N/A' && (
                  <p className="text-base text-gray-800 dark:text-white">
                    <span className="font-medium">Address:</span> {donationData.donor.address}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-white/10">
            Donation Details
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Amount</h4>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{donationData.donation.amount}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Type</h4>
              <p className="text-base font-medium text-gray-800 dark:text-white">
                <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full text-sm">
                  {donationData.donation.type}
                </span>
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Status</h4>
              <StatusBadge status={donationData.donation.status} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Date & Time</h4>
              <p className="text-base text-gray-800 dark:text-white">
                {donationData.donation.date} at {donationData.donation.time}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Payment Method</h4>
              <p className="text-base text-gray-800 dark:text-white flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodStyle(donationData.donation.paymentMethod)}`}>
                  {donationData.donation.paymentMethod || 'Online Payment'}
                </span>
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Transaction ID</h4>
              <div className="flex items-center gap-2">
                <p className="text-base font-mono text-gray-800 dark:text-white">{donationData.donation.transactionId}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(donationData.donation.transactionId);
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Copy transaction ID"
                >
                  <Copy className="h-4 w-4 text-gray-500" />
                </button>
                {copySuccess && (
                  <span className="text-xs text-green-500">Copied!</span>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Purpose</h4>
              <p className="text-base text-gray-800 dark:text-white">{donationData.donation.purpose}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-white/10">
              Recipient Information
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Recipient</h4>
                <p className="text-base text-gray-800 dark:text-white">{donationData.recipient.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Institution</h4>
                <p className="text-base text-gray-800 dark:text-white">{donationData.recipient.institution}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Program</h4>
                <p className="text-base text-gray-800 dark:text-white">{donationData.recipient.program}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-white/10">
              Actions
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <Link
                href={`/admin/donations/status?id=${donationId}`}
                className="w-full px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-all duration-300 text-center flex items-center justify-center"
              >
                <Edit className="h-4 w-4 mr-2" /> Update Status
              </Link>
              <button
                className="w-full px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-all duration-300 text-center flex items-center justify-center"
                onClick={downloadReceipt}
                disabled={isGeneratingReceipt}
              >
                {isGeneratingReceipt ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-emerald-800 dark:border-emerald-400 border-t-transparent rounded-full"></div> Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" /> Download Receipt
                  </>
                )}
              </button>
              <button
                className="w-full px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-all duration-300 text-center flex items-center justify-center"
                onClick={() => setShowMessageModal(true)}
              >
                <MessageSquare className="h-4 w-4 mr-2" /> Send Message to Donor
              </button>
              <button
                className="w-full px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800/50 transition-all duration-300 text-center flex items-center justify-center"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete Donation
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReceipt && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex justify-between items-center">
            <span>Receipt Preview</span>
            <button
              onClick={() => setShowReceipt(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </h3>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 max-w-3xl mx-auto">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">AIC</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Akode Islamic Centre</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Official Donation Receipt
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium inline-flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" /> {donationData.donation.status}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Receipt #{donationData.id}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {donationData.donation.date}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-200 dark:border-gray-700">DONOR INFORMATION</h4>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                  <p className="text-base font-semibold text-gray-800 dark:text-white">{donationData.donor.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Contact</p>
                  <p className="text-sm text-gray-800 dark:text-white">{donationData.donor.email}</p>
                  <p className="text-sm text-gray-800 dark:text-white">{donationData.donor.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                  <p className="text-sm text-gray-800 dark:text-white">
                    {donationData.donor.location}, {donationData.donor.district}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-200 dark:border-gray-700">DONATION DETAILS</h4>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{donationData.donation.amount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Purpose</p>
                  <div className="flex items-center">
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full text-xs font-medium">
                      {donationData.donation.type}
                    </span>
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{donationData.recipient.program}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Transaction Details</p>
                  <p className="text-sm text-gray-800 dark:text-white flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodStyle(donationData.donation.paymentMethod)}`}>
                      {donationData.donation.paymentMethod}
                    </span>
                  </p>
                  <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-1">
                    ID: {donationData.donation.transactionId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Date & Time</p>
                  <p className="text-sm text-gray-800 dark:text-white">
                    {donationData.donation.date} at {donationData.donation.time}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
              <div className="flex gap-6 items-center">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">ORGANIZATION</h4>
                  <p className="text-sm text-gray-800 dark:text-white">{donationData.recipient.institution}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Oorkadavu, Malappuram, Kerala</p>
                </div>
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                  QR Code
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Thank you for your generous contribution!
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This receipt is electronically generated and is valid without signature.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                For any queries, please contact us at support@aicamal.org
              </p>
            </div>
          </div>

          <div className="flex justify-center mt-6 space-x-4">
            <button
              className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-all duration-300 flex items-center"
              onClick={downloadReceipt}
              disabled={isGeneratingReceipt}
            >
              {isGeneratingReceipt ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-emerald-800 dark:border-emerald-400 border-t-transparent rounded-full"></div> Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" /> Download PDF
                </>
              )}
            </button>
            <button
              className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-all duration-300 flex items-center"
              onClick={copyReceiptText}
            >
              {copySuccess ? (
                <>
                  <Check className="h-4 w-4 mr-2" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" /> Copy Text
                </>
              )}
            </button>
            <button
              className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-all duration-300 flex items-center"
              onClick={() => setShowMessageModal(true)}
            >
              <Share2 className="h-4 w-4 mr-2" /> Share
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Confirm Deletion</h3>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete the donation <span className="font-semibold">#{donationData.id}</span> from <span className="font-semibold">{donationData.donor.name}</span>?
              <br /><br />
              <span className="text-red-600 dark:text-red-400 text-sm">This action cannot be undone.</span>
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={deleteDonation}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all duration-300 flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete Donation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMessageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Send Message to Donor</h3>
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setMessageError("");
                  setMessageSuccess("");
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {messageError && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg text-sm">
                {messageError}
              </div>
            )}

            {messageSuccess && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-lg text-sm flex items-center">
                <Check className="h-4 w-4 mr-2" /> {messageSuccess}
              </div>
            )}

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Send a WhatsApp message to {donationData.donor.name} at {donationData.donor.phone}
              </p>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mb-3 text-xs text-gray-500 dark:text-gray-400">
                You can use the following placeholders in your message:
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="font-mono">{"{name}"}</div><div>Donor&apos;s name</div>
                  <div className="font-mono">{"{amount}"}</div><div>Donation amount</div>
                  <div className="font-mono">{"{type}"}</div><div>Donation type</div>
                  <div className="font-mono">{"{id}"}</div><div>Donation ID</div>
                  <div className="font-mono">{"{date}"}</div><div>Donation date</div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="messageText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message Text
              </label>
              <textarea
                id="messageText"
                rows={6}
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Enter your message here..."
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setMessageError("");
                  setMessageSuccess("");
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                disabled={isSendingMessage}
              >
                Cancel
              </button>
              <button
                onClick={sendMessageToDonor}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center"
                disabled={isSendingMessage}
              >
                {isSendingMessage ? (
                  <>
                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-1" /> Send Message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DetailedViewPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <DonationDetailContent />
    </Suspense>
  );
}