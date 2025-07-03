"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import { Box } from "@/components/users-section/types"; // Import shared Box type

interface BoxPaymentProps {
  box: Box;
  phoneNumber: string;
  onBack: () => void;
  onPaymentComplete: () => void;
}

interface BoxData {
  _id: string;
  name: string;
  mobileNumber: string;
  serialNumber: string;
  district: string;
  panchayath: string;
  amount?: string | number;
  phone?: string;
  email?: string;
  boxId?: string;
  type?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
}

// Declare Razorpay type for window
export interface RazorpayError {
  description: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  theme: { color: string };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      on(event: string, callback: (response: { error: RazorpayError }) => void): void;
      open: () => void;
    };
  }
}

const BoxPayment = ({ box, phoneNumber, onBack, onPaymentComplete }: BoxPaymentProps) => {
  const router = useRouter();
  const [customAmount, setCustomAmount] = useState<number | "">("");
  const [amountError, setAmountError] = useState("");
  const [paymentStep, setPaymentStep] = useState<"details" | "method" | "processing" | "success">("details");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [boxData, setBoxData] = useState<BoxData | null>(null);
  const { startLoading, stopLoading } = useLoading();

  // Fetch box data
  useEffect(() => {
    const fetchBox = async () => {
      startLoading();
      setIsLoading(true);
      try {
        const response = await fetch(`/api/boxes/${box.id}`, {
          headers: {
            "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
          },
        });
        if (!response.ok) throw new Error("Failed to fetch box");
        const data: BoxData = await response.json();
        setBoxData(data);
        console.log(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
        stopLoading();
      }
    };
    fetchBox();
  }, [box.id, startLoading, stopLoading]);

  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setCustomAmount("");
      setAmountError("");
    } else {
      const numValue = parseFloat(value);
      setCustomAmount(numValue);
      if (numValue <= 0) {
        setAmountError("Amount must be greater than 0");
      } else {
        setAmountError("");
      }
    }
  };

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle pay now button
  const handlePayNow = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (customAmount === "" || typeof customAmount !== "number" || customAmount <= 0) {
      setAmountError("Please enter a valid amount");
      return;
    }

    if (!boxData) {
      setError("Box data not loaded");
      return;
    }

    try {
      startLoading();
      setIsLoading(true);
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Failed to load Razorpay SDK");

      // Create Razorpay order
      console.log(boxData, "ffffffffffffffffffffff");

      const response = await fetch("/api/donations/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
        },
        body: JSON.stringify({
          amount: customAmount * 100,
          name: boxData.name,
          phone: boxData.phone,
          boxId: boxData._id,
          type: "Box",
          email: boxData.email,
          district: boxData.district,
          panchayat: boxData.panchayath,
        }), // Convert to paise
      });

      const orderData = await response.json();
      if (!response.ok) throw new Error(orderData.error || "Order creation failed");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourKeyIDHere",
        amount: customAmount * 100, // In paise
        currency: "INR",
        name: "Donation Box Payment",
        description: `Payment for Box ${boxData.serialNumber}`,
        order_id: orderData.orderId,
        prefill: {
          name: boxData.name,
          email: boxData.email,
          contact: boxData.phone,
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          const paymentData = {
            amount: customAmount,
            name: boxData.name,
            phone: boxData.phone,
            boxId: boxData._id,
            type: "Box",
            email: boxData.email,
            district: boxData.district,
            panchayat: boxData.panchayath,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };
          startLoading();

          // Update box payment status
          // const sresponse = await fetch(`/api/boxes/${box.id}/pay`, {
          //   method: "POST",
          //   headers: {
          //     "Content-Type": "application/json",
          //     "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
          //   },
          //   body: JSON.stringify({ paymentDate: new Date(), amount: customAmount }),
          // });
          // if (!sresponse.ok) throw new Error("Payment update failed");
          // const updatedBox = await sresponse.json();
          // setBoxData(updatedBox.box); // Update UI

          stopLoading();
          router.push(
            `/paybox/success?donationId=${"no id"}&amount=${customAmount}&name=${encodeURIComponent(
              boxData.name
            )}&phone=${paymentData.phone}&type=${"Box"}&district=${boxData.district || "Other"}&panchayat=${
              boxData.panchayath || ""
            }&paymentId=${response.razorpay_payment_id}&orderId=${response.razorpay_order_id}`
          );

          setPaymentStep("success");
          onPaymentComplete();
        },
       
        theme: { color: "#10B981" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      stopLoading();
      setIsLoading(false);
    }
  };

  return (
    <>
      {paymentStep === "details" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center mb-6">
            <button
              onClick={onBack}
              className="mr-4 p-2 bg-white rounded-full shadow-sm hover:shadow-md hover:bg-indigo-100 transition-all duration-200"
            >
              <svg
                className="w-6 h-6 text-indigo-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h3 className="text-2xl font-bold text-indigo-900 tracking-tight">Pay-Box Details</h3>
          </div>

          {/* Details Section */}
          <div className="p-5 bg-indigo-50/50 rounded-xl shadow-inner">
            {[
              ["Box Serial Number", `#${box.serialNumber}`],
              ["Phone", phoneNumber],
              ["ID", box.id],
              ["Last Payment", new Date(box.lastPayment).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })],
              ["Status", box.status === "active" ? "Active" : box.status === "dead" ? "Dead" : "Overdue", box.status],
            ].map(([label, value, status]) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-indigo-100 last:border-b-0">
                <span className="text-indigo-800 font-medium text-sm">{label}:</span>
                <span
                  className={`font-semibold text-sm ${
                    label === "Status"
                      ? status === "active"
                        ? "text-green-600"
                        : status === "dead"
                        ? "text-red-600"
                        : "text-red-600"
                      : "text-indigo-900"
                  }`}
                >
                  {value}
                </span>
              </div>
            ))}

            {
              box.status !== "dead" &&
              <div className="p-4 rounded-xl">
                <p className="text-indigo-800 font-medium text-sm">Payment Status</p>
                <p className={`font-medium ${box.paymentStatus === "Paid" ? "text-green-600" : "text-red-600"}`}>
                  {box.paymentStatus} ({box.currentPeriod})
                </p>
              </div>
            }

            {/* Payment Input */}
            <div className="mt-6">
              <label className="block text-indigo-800 font-medium text-sm mb-2">Payment Amount</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={handleAmountChange}
                  min="1"
                  step="0.01"
                  className={`w-full p-3 pl-8 border-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200 ${
                    amountError ? "border-red-300 focus:ring-red-500" : "border-indigo-200 focus:ring-indigo-500"
                  }`}
                  disabled={isLoading}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 font-medium">₹</span>
              </div>
              {(amountError || error) && (
                <p className="text-red-600 text-xs mt-1 animate-pulse">{amountError || error}</p>
              )}
            </div>
          </div>

          {/* Pay Button */}
          <form onSubmit={handlePayNow}>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading || !customAmount || Number(customAmount) <= 0}
              className={`w-full mt-6 py-3 rounded-lg font-semibold text-white shadow-md transition-all duration-300 ${
                isLoading || !customAmount || Number(customAmount) <= 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Processing
                </span>
              ) : (
                "Pay Now"
              )}
            </motion.button>
          </form>
        </motion.div>
      )}

      {paymentStep === "processing" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
          </div>
          <h3 className="text-2xl font-bold text-indigo-900 mb-2">Processing Payment</h3>
          <p className="text-gray-600">
            Please wait while we process your payment
          </p>
          <p className="text-indigo-600 mt-4">Please do not close this window...</p>
        </motion.div>
      )}

      {paymentStep === "success" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="text-center py-8"
        >
          <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-indigo-900 mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-4">
            Your payment of ₹{typeof customAmount === "number" ? customAmount.toLocaleString() : "0"} has been successfully processed.
          </p>
          <div className="bg-indigo-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-indigo-600">Transaction ID:</span>
              <span className="font-medium text-indigo-900">TXN{Math.floor(Math.random() * 1000000)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-indigo-600">Date & Time:</span>
              <span className="font-medium text-indigo-900">
                {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-4">A receipt has been sent to your registered mobile number.</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-300"
            onClick={onPaymentComplete}
          >
            Done
          </motion.button>
        </motion.div>
      )}
    </>
  );
};

export default BoxPayment;