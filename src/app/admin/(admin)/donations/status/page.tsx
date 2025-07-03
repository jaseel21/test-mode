"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';

// Define Donation interface
interface Donation {
  id: string;
  donor: string;
  email: string;
  phone: string;
  amount: string;
  type: string;
  status: string;
  date: string;
  transactionId: string;
  createdAtTimestamp?: number; // Optional, used in mock history
}

// Define Status History interface
interface StatusHistoryItem {
  status: string;
  timestamp: string;
  note: string;
  user: string;
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
function UpdateStatusContent() {
  const searchParams = useSearchParams();
  const donationId = searchParams.get('id');

  const [donation, setDonation] = useState<Donation>({
    id: '',
    donor: '',
    email: '',
    phone: '',
    amount: '',
    type: '',
    status: '',
    date: '',
    transactionId: ''
  });

  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState<string>("");
  const [notifyDonor, setNotifyDonor] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([]);

  useEffect(() => {
    if (!donationId) return;

    const fetchDonation = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await fetch(`/api/donations/dashboard/donations/${donationId}`,
          {
            headers: {
              'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch donation data');
        }

        const data: Donation & { createdAtTimestamp?: number } = await response.json();

        setDonation({
          id: data.id,
          donor: data.donor,
          email: data.email || 'N/A',
          phone: data.phone || 'N/A',
          amount: data.amount,
          type: data.type,
          status: data.status,
          date: new Date(data.date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          transactionId: data.transactionId || 'N/A'
        });

        setNewStatus(data.status);

        setStatusHistory([
          {
            status: "Created",
            timestamp: new Date(data.createdAtTimestamp ?? Date.now()).toLocaleString(),
            note: "Donation received",
            user: "System"
          },
          {
            status: data.status,
            timestamp: new Date(data.createdAtTimestamp ?? Date.now()).toLocaleString(),
            note: `Initial status set to ${data.status}`,
            user: "System"
          }
        ]);
      } catch (error) {
        console.error("Error fetching donation:", error);
        setErrorMessage('Failed to load donation. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonation();
  }, [donationId]);

  const StatusBadge = ({ status }: { status: string }) => {
    let bgColor = "bg-gray-500/20 text-gray-500";

    if (status === "Completed") {
      bgColor = "bg-green-500/20 text-green-500";
    } else if (status === "Pending") {
      bgColor = "bg-amber-500/20 text-amber-500";
    } else if (status === "Failed") {
      bgColor = "bg-red-500/20 text-red-500";
    } else if (status === "Created") {
      bgColor = "bg-blue-500/20 text-blue-500";
    } else if (status === "Refunded") {
      bgColor = "bg-purple-500/20 text-purple-500";
    }

    return (
      <span className={`px-3 py-1 rounded-full ${bgColor} text-sm font-medium`}>
        {status}
      </span>
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newStatus === donation.status) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch(`/api/donations/dashboard/donations/${donationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
        body: JSON.stringify({
          status: newStatus,
          statusNote: statusNote,
          notifyDonor: notifyDonor
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // const updatedDonation: Donation = await response.json();

      setDonation(prev => ({
        ...prev,
        status: newStatus
      }));

      setStatusHistory(prev => [...prev, {
        status: newStatus,
        timestamp: new Date().toLocaleString(),
        note: statusNote || `Status updated to ${newStatus}`,
        user: "Admin"
      }]);

      setShowSuccess(true);
      setStatusNote('');

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating status:", error);
      setErrorMessage('Failed to update status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            Update Donation Status <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">#{donation.id}</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Change the status of this donation and notify the donor
          </p>
        </div>

        <Link
          href="/admin/donations/all"
          className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300"
        >
          Back to Donations
        </Link>
      </div>

      {errorMessage && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage('')}
            className="text-red-800 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {showSuccess && (
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm font-medium">Status updated successfully!</span>
            {notifyDonor && <span className="ml-2 text-xs">Notification has been sent to the donor.</span>}
          </div>
          <button
            onClick={() => setShowSuccess(false)}
            className="text-green-800 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-white/10">
            Donation Information
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Donor Name</h4>
              <p className="text-lg font-bold text-gray-800 dark:text-white">{donation.donor}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Contact</h4>
              <p className="text-base text-gray-800 dark:text-white">
                <a href={`mailto:${donation.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">{donation.email}</a>
              </p>
              <p className="text-base text-gray-800 dark:text-white mt-1">{donation.phone}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Amount</h4>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{donation.amount}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Type</h4>
              <p className="text-base font-medium text-gray-800 dark:text-white">
                <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full text-sm">
                  {donation.type}
                </span>
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Date</h4>
              <p className="text-base text-gray-800 dark:text-white">{donation.date}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Transaction ID</h4>
              <p className="text-base font-mono text-gray-800 dark:text-white">{donation.transactionId}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-white/10">
            Current Status
          </h3>

          <div className="mb-6">
            <div className="p-4 bg-white/20 dark:bg-gray-800/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <StatusBadge status={donation.status} />
                <span className="text-xs text-gray-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${donation.status === "Completed"
                      ? "bg-green-500"
                      : donation.status === "Pending"
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                  style={{ width: donation.status === "Completed" ? "100%" : donation.status === "Pending" ? "50%" : "100%" }}
                ></div>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-white/10">
            Update Status
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 block mb-1">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-md rounded-lg p-2 text-gray-800 dark:text-gray-200 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 block mb-1">
                Status Note (Optional)
              </label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add an optional note about this status change..."
                className="w-full bg-white/10 backdrop-blur-md rounded-lg p-2 text-gray-800 dark:text-gray-200 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[80px]"
              ></textarea>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyDonor"
                checked={notifyDonor}
                onChange={(e) => setNotifyDonor(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="notifyDonor" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Notify donor about this status change
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <Link
                href="/admin/donations/all"
                className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || newStatus === donation.status}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isSubmitting || newStatus === donation.status
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600"
                  }`}
              >
                {isSubmitting ? "Updating..." : "Update Status"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-white/10">
            Status History
          </h3>

          <div className="relative pl-4 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
            {statusHistory.map((item, index) => (
              <div key={index} className="mb-6 relative">
                <div className="absolute -left-4 w-3 h-3 rounded-full bg-blue-500 mt-1.5"></div>
                <div className="flex items-start justify-between mb-1">
                  <StatusBadge status={item.status} />
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{item.timestamp}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.note}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">By: {item.user}</p>
              </div>
            ))}

            {isSubmitting && (
              <div className="mb-4 relative">
                <div className="absolute -left-4 w-3 h-3 rounded-full bg-emerald-500 mt-1.5 animate-pulse"></div>
                <div className="flex items-center mb-1">
                  <StatusBadge status={newStatus} />
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 animate-pulse">Processing...</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-2">
            <Link
              href={`/admin/donations/detail?id=${donationId}`}
              className="w-full px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-all duration-300 text-center block"
            >
              View Donation Details
            </Link>
            <button className="w-full px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-all duration-300 text-center">
              Download Statement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UpdateStatusPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <UpdateStatusContent />
    </Suspense>
  );
}