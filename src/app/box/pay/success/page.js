"use client";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function BoxPaymentSuccessPage() {
  const searchParams = useSearchParams();

  const donationId = searchParams.get("donationId");
  const amount = searchParams.get("amount");
  const name = decodeURIComponent(searchParams.get("name") || "");
  const phone = searchParams.get("phone");
  const paymentId = searchParams.get("paymentId");
  const orderId = searchParams.get("orderId");

  const handleDownloadReceipt = async () => {
    try {
      const response = await fetch("/api/donations/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json",
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
         },
        body: JSON.stringify({
          donationId,
          amount,
          name,
          phone,
          paymentId,
          orderId,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate receipt");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Box_Payment_Receipt_${donationId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading receipt:", error);
      alert("Failed to download receipt. Please try again.");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white flex items-center justify-center p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
      >
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <motion.div
            variants={itemVariants}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
          >
            {/* Replaced CheckCircleIcon with inline SVG */}
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        </div>
        <motion.h1
          variants={itemVariants}
          className="text-3xl font-bold text-gray-900 text-center mb-2"
        >
          Payment Successful!
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="text-lg text-gray-600 text-center mb-8"
        >
          Thank you for your payment! Here are the details of your contribution.
        </motion.p>

        {/* Payment Details */}
        <motion.div
          variants={containerVariants}
          className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Details</h2>
          <div className="space-y-3 text-gray-700">
            <motion.div variants={itemVariants} className="flex justify-between">
              <span className="font-medium">Name:</span>
              <span className="text-gray-900">{name || "N/A"}</span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex justify-between">
              <span className="font-medium">Phone:</span>
              <span className="text-gray-900">{phone || "N/A"}</span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex justify-between">
              <span className="font-medium">Amount:</span>
              <span className="text-gray-900">₹{amount ? parseFloat(amount).toLocaleString() : "N/A"}</span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex justify-between">
              <span className="font-medium">Payment ID:</span>
              <span className="text-gray-900">{paymentId || "N/A"}</span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex justify-between">
              <span className="font-medium">Order ID:</span>
              <span className="text-gray-900">{orderId || "N/A"}</span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex justify-between">
              <span className="font-medium">Donation ID:</span>
              <span className="text-gray-900">{donationId || "N/A"}</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownloadReceipt}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
        >
          Download Receipt
        </motion.button>
        <motion.a
          variants={itemVariants}
          href="/boxes"
          className="mt-4 block text-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
        >
          Back to Boxes
        </motion.a>
      </motion.div>
    </div>
  );
}