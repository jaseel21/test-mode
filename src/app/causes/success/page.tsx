"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { generatePDF } from "@/lib/receipt-pdf";
import Link from "next/link";

interface ReceiptData {
  _id: string;
  amount: number;
  name: string;
  phone: string;
  type: string;
  district: string;
  panchayat: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  instituteId?: string;
  createdAt: string;
}

const CausesSuccessPage = () => {
  const searchParams = useSearchParams();
  const [details, setDetails] = useState<ReceiptData | null>(null);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract data from query parameters and format it
  useEffect(() => {
    const donationId = searchParams.get("donationId") || "";
    const amount = Number(searchParams.get("amount") || "0");
    const name = decodeURIComponent(searchParams.get("name") || "");
    const phone = searchParams.get("phone") || "";
    const type = searchParams.get("type") || "";
    const district = searchParams.get("district") || "";
    const panchayat = searchParams.get("panchayat") || "";
    const razorpayPaymentId = searchParams.get("paymentId") || "";
    const razorpayOrderId = searchParams.get("orderId") || "";
    const instituteId = searchParams.get("instituteId") || undefined;

    const receiptData: ReceiptData = {
      _id: donationId,
      amount,
      name,
      phone,
      type,
      district,
      panchayat,
      razorpayPaymentId,
      razorpayOrderId,
      instituteId,
      createdAt: new Date().toISOString(),
    };

    setDetails(receiptData);
  }, [searchParams]);

  // Handle receipt download
  const handleDownloadReceipt = async () => {
    if (!details) return;

    setIsLoadingPDF(true);
    setError(null);

    try {
      await generatePDF(details);
      console.log("Receipt downloaded successfully");
    } catch (err) {
      console.error("Error generating receipt:", err);
      setError("Failed to generate receipt. Please try again.");
    } finally {
      setIsLoadingPDF(false);
    }
  };

  if (!details) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-gray-700 dark:text-gray-300 font-medium text-lg"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-200/50 dark:border-gray-700/50"
      >
        {/* Header Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mb-4"
          >
            <svg
              className="w-8 h-8 text-emerald-600 dark:text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
            Thank You, <span className="text-indigo-700 dark:text-indigo-400">{details.name}</span>!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            Your <span className="font-medium lowercase">{details.type}</span> donation of{" "}
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">₹{details.amount.toLocaleString('en-IN')}</span> has been successfully processed.
          </p>
        </div>

        {/* Details Section */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6 shadow-inner">
          <dl className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex justify-between items-center">
              <dt className="font-medium text-gray-500 dark:text-gray-400">Name</dt>
              <dd className="font-semibold text-gray-900 dark:text-gray-100">{details.name}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="font-medium text-gray-500 dark:text-gray-400">Phone</dt>
              <dd className="font-semibold text-gray-900 dark:text-gray-100">{details.phone}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="font-medium text-gray-500 dark:text-gray-400">Type</dt>
              <dd className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{details.type}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="font-medium text-gray-500 dark:text-gray-400">Payment ID</dt>
              <dd className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px]">{details.razorpayPaymentId}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="font-medium text-gray-500 dark:text-gray-400">Location</dt>
              <dd className="font-semibold text-gray-900 dark:text-gray-100">
                {details.panchayat ? `${details.panchayat}, ${details.district}` : details.district}
              </dd>
            </div>
            {details.instituteId && (
              <div className="flex justify-between items-center">
                <dt className="font-medium text-gray-500 dark:text-gray-400">Institute ID</dt>
                <dd className="font-semibold text-gray-900 dark:text-gray-100">{details.instituteId}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 dark:text-red-400 text-sm mb-6 text-center font-medium"
          >
            {error}
          </motion.p>
        )}

        {/* Download Button */}
        <motion.button
          onClick={handleDownloadReceipt}
          disabled={isLoadingPDF}
          whileHover={{ scale: 1.03, boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)" }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-700 dark:to-indigo-900 text-white py-3 rounded-xl font-semibold text-sm tracking-wide shadow-lg hover:from-indigo-700 hover:to-indigo-900 dark:hover:from-indigo-800 dark:hover:to-indigo-950 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2"
        >
          {isLoadingPDF ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating Receipt...
            </span>
          ) : (
            "Download Your Receipt"
          )}
        </motion.button>

        {/* Return to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/causes"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-sm transition-colors duration-200"
          >
            Return to donation
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default CausesSuccessPage;