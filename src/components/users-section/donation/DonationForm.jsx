"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import LocationSelector from "../LocationSelector";
import DonationTypeSelector from "./DonationTypeSelector";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";

export default function DonationForm({
  donationTypes,
  onSubmit,
  selectedAmount,
}) {
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    donationType: "",
    location: "",
    amount: selectedAmount || 0,
    email: "",
    message: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    setForm((prev) => ({ ...prev, amount: selectedAmount }));
  }, [selectedAmount]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (location) => {
    setForm((prev) => ({ ...prev, location }));
  };

  const handleDonationTypeChange = (donationType) => {
    setForm((prev) => ({ ...prev, donationType }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    startLoading();
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Failed to load Razorpay SDK");

      const response = await fetch("/api/donations/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
        body: JSON.stringify({
          amount: form.amount * 100,
          type: form.donationType,
          name: form.fullName,
          phone: form.phoneNumber,
          email: form.email,
          district: form.location.split(", ")[0]?.trim(),
          panchayat: form.location.split(", ")[1]?.trim(),
          message: form.message,
          // Add these if your form supports them
          boxId: form.boxId || null,
          instituteId: form.instituteId || null,
          campaignId: form.campaignId || null,
        }),
      });

      const orderData = await response.json();
      if (!response.ok) throw new Error(orderData.error || "Order creation failed");

      const [district, panchayath] = form.location.split(", ").map((part) => part.trim());

      return new Promise((resolve, reject) => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourKeyIDHere",
          amount: form.amount * 100,
          currency: "INR",
          name: "AIC Amal App",
          description: `Donation for ${form.donationType}`,
          order_id: orderData.orderId,
          prefill: { 
            name: form.fullName, 
            email:form.email,
            contact: form.phoneNumber 
          },
          handler: async (response) => {
            try {
              const paymentData = {
                amount: form.amount,
                name: form.fullName,
                phone: form.phoneNumber,
                type: form.donationType,
                district: district,
                panchayat: panchayath,
                email: form.email,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              };

              startLoading();
              // const saveResponse = await fetch("/api/donations/create", {
              //   method: "POST",
              //   headers: {
              //     "Content-Type": "application/json",
              //     'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
              //   },
              //   body: JSON.stringify(paymentData),
              // });

              // const saveData = await saveResponse.json();
              // if (!saveResponse.ok) throw new Error(saveData.error || "Failed to save donation");

              router.push(
                `/donation/success?donationId=${form.phoneNumber}&amount=${form.amount}&name=${encodeURIComponent(
                  form.fullName
                )}&phone=${form.phoneNumber}&type=${form.donationType}&district=${district || "Other"}&panchayat=${panchayath || ""
                }&paymentId=${response.razorpay_payment_id}&orderId=${response.razorpay_order_id}`
              );

              if (onSubmit) {
                await onSubmit(form);
              }
              resolve({
                // id: saveData.id,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
              });
            } catch (error) {
              reject(error);
            } finally {
              stopLoading();
            }
          },
          // prefill: { name: form.fullName, contact: form.phoneNumber },
          theme: { color: "#10B981" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      });
    } catch (error) {
      setError(`Payment initiation failed: ${error.message}`);
      stopLoading();
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
      <h3 className="text-2xl font-bold text-indigo-900 dark:text-indigo-200 mb-6">Donor Information</h3>

      {selectedAmount > 0 && (
        <div className="bg-indigo-50 dark:bg-indigo-900 p-4 rounded-lg mb-6 flex justify-between items-center">
          <span className="text-indigo-800 dark:text-indigo-200 font-medium">Selected Amount:</span>
          <span className="text-2xl font-bold text-indigo-900 dark:text-indigo-200">
            ₹{selectedAmount.toLocaleString()}
          </span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">{error}</div>
      )}

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-indigo-800 dark:text-indigo-300 font-medium mb-2">Full Name</label>
          <input
            type="text"
            name="fullName"
            placeholder="Enter your full name"
            className="w-full p-4 border border-indigo-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
            value={form.fullName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label className="block text-indigo-800 dark:text-indigo-300 font-medium mb-2">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            placeholder="Enter your phone number"
            className="w-full p-4 border border-indigo-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
            value={form.phoneNumber}
            onChange={handleInputChange}
            pattern="[0-9]{10}"
            required
          />
        </div>

        <div>
          <label className="block text-indigo-800 dark:text-indigo-300 font-medium mb-2">Email (Optional)</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email address"
            className="w-full p-4 border border-indigo-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
            value={form.email}
            onChange={handleInputChange}
          />
        </div>

        <DonationTypeSelector
          donationTypes={donationTypes}
          selectedType={form.donationType}
          onSelectType={handleDonationTypeChange}
        />

        <LocationSelector
          selectedLocation={form.location}
          onLocationChange={handleLocationChange}
        />

        <div>
          <label className="block text-indigo-800 dark:text-indigo-300 font-medium mb-2">Message (Optional)</label>
          <textarea
            name="message"
            placeholder="Add a personal message or note"
            rows={3}
            className="w-full p-4 border border-indigo-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
            value={form.message}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={
          isLoading ||
          !selectedAmount ||
          !form.fullName ||
          !form.phoneNumber ||
          !form.donationType ||
          !form.location
        }
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          "Donate Now"
        )}
      </motion.button>

      {!selectedAmount && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900 border border-amber-100 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-200 text-sm">
          Please select a donation amount before proceeding
        </div>
      )}

      <div className="mt-6 flex items-center justify-center">
        <div className="bg-indigo-50 dark:bg-indigo-900 p-3 rounded-full mr-3">
          <svg
            className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Your payment information is secured with industry-standard encryption
        </p>
      </div>
    </form>
  );
}