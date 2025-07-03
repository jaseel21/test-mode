"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { CauseType, CauseFormData } from "@/components/users-section/causes/types";
import CauseCard from "@/components/users-section/causes/CauseCard";
import ThankYouModal from "@/components/users-section/causes/ThankYouModal";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";

// Define Razorpay types
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; contact: string };
  theme: { color: string };
}

export default function CausesPage() {
  const [activeForm, setActiveForm] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();

  // Donation amounts for quick selection
  const donationAmounts = [100, 500, 1000, 5000];

  // Causes data
  const causes: CauseType[] = [
    {
      id: 1,
      type: "Yatheem",
      name: "Yatheem",
      description: "Support orphaned children with care, education, and a loving environment.",
      benefits: ["Food and nutrition", "Quality education", "Healthcare", "Safe housing"],
      icon: (
        <svg
          className="w-12 h-12 text-indigo-500 dark:text-indigo-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      id: 2,
      type: "Hafiz",
      name: "Hafiz",
      description: "Support students dedicated to memorizing and understanding religious scripture.",
      benefits: ["Educational materials", "Qualified teachers", "Safe learning environment", "Meals during study"],
      icon: (
        <svg
          className="w-12 h-12 text-indigo-500 dark:text-indigo-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
          />
        </svg>
      ),
    },
    {
      id: 3,
      type: "Building",
      name: "Building Construction",
      description: "Help construct community buildings, schools, and places of worship.",
      benefits: ["Community centers", "Educational facilities", "Worship spaces", "Water and sanitation"],
      icon: (
        <svg
          className="w-12 h-12 text-indigo-500 dark:text-indigo-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
  ];

  // Handle cause form activation
  const handleActivateForm = (id: number) => {
    setActiveForm(id);
  };

  // Handle cause form deactivation
  const handleDeactivateForm = () => {
    setActiveForm(null);
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle form submission
  const handleSubmit = async (formData: CauseFormData): Promise<void> => {
    startLoading();
    setIsLoading(true);
    setError(null);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Failed to load Razorpay SDK");
      const [district, panchayath] = formData.location.split(", ").map((part) => part.trim());

      const response = await fetch("/api/donations/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
        },
        body: JSON.stringify(
          {  
            amount: formData.amount * 100,
          type: formData.donationType,
          name: formData.fullName,
          phone: formData.phoneNumber,
          email: formData.email,
          district:district,
          panchayat: panchayath,
         
        }
        ),
      });

      const orderData: { orderId: string; error?: string } = await response.json();
      if (!response.ok) throw new Error(orderData.error || "Order creation failed");

      

      await new Promise<void>((resolve, reject) => {
        const options: RazorpayOptions = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
          amount: formData.amount * 100,
          currency: "INR",
          name: "AIC Amal App",
          description: `Donation for ${formData.donationType}`,
          order_id: orderData.orderId,
          handler: async (response: RazorpayResponse) => {
            try {
              // const paymentData = {
              //   amount: formData.amount,
              //   name: formData.fullName,
              //   phone: formData.phoneNumber,
              //   type: formData.donationType,
              //   district: district,
              //   panchayat: panchayath,
              //   email: formData.email,
              //   razorpayPaymentId: response.razorpay_payment_id,
              //   razorpayOrderId: response.razorpay_order_id,
              //   razorpaySignature: response.razorpay_signature,
              // };

              // const saveResponse = await fetch("/api/donations/create", {
              //   method: "POST",
              //   headers: {
              //     "Content-Type": "application/json",
              //     "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
              //   },
              //   body: JSON.stringify(paymentData),
              // });

              // const saveData: { id: string; error?: string } = await saveResponse.json();
              // if (!saveResponse.ok) throw new Error(saveData.error || "Failed to save donation");

              router.push(
                `/causes/success?donationId=${"noId"}&amount=${formData.amount}&name=${encodeURIComponent(
                  formData.fullName
                )}&phone=${formData.phoneNumber}&type=${formData.donationType}&district=${
                  district || "Other"
                }&panchayat=${panchayath || ""}&paymentId=${response.razorpay_payment_id}&orderId=${
                  response.razorpay_order_id
                }`
              );

              resolve();
            } catch (error) {
              reject(error);
            }
          },
          prefill: { name: formData.fullName, contact: formData.phoneNumber },
          theme: { color: "#10B981" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      });

      setActiveForm(null);
      stopLoading();
    } catch (error) {
      setError(`Payment initiation failed: ${(error as Error).message}`);
      console.error("Error processing donation:", error);
      alert("There was an error processing your donation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Close thank you modal
  const handleCloseThankYou = () => {
    setShowThankYou(false);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <>
      {/* Page Header */}
      <section className="pt-32 pb-12 px-6 bg-gradient-to-r from-indigo-900 to-purple-900 dark:from-gray-900 dark:to-gray-800 text-white">
        <div className="container mx-auto max-w-6xl">
          <Link
            href="/"
            className="inline-flex items-center text-indigo-200 hover:text-white dark:text-gray-300 dark:hover:text-gray-100 mb-6 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>

          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">Support Our Causes</h1>
          <p className="text-xl text-indigo-200 dark:text-gray-300 max-w-3xl">
            Your donation to these specific causes creates direct impact where it&apos;s needed most.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          {/* Thank You Modal */}
          <ThankYouModal isVisible={showThankYou} onClose={handleCloseThankYou} />

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">{error}</div>
          )}

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {causes.map((cause) => (
              <CauseCard
                key={cause.id}
                cause={cause}
                isActive={activeForm === cause.id}
                donationAmounts={donationAmounts}
                isLoading={isLoading}
                onActivate={handleActivateForm}
                onDeactivate={handleDeactivateForm}
                onSubmit={handleSubmit}
              />
            ))}
          </motion.div>

          {/* Informational Section */}
          <div className="mt-16 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-200 mb-6">How Your Donation Makes a Difference</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-full mb-4">
                  <svg
                    className="w-10 h-10 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-300 mb-2">100% Donation</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  100% of your donation goes directly to the cause you choose, with no administrative fees deducted.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-full mb-4">
                  <svg
                    className="w-10 h-10 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-300 mb-2">Secure & Transparent</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your donation is processed securely, and you can track how your contribution is making an impact.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-full mb-4">
                  <svg
                    className="w-10 h-10 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-300 mb-2">Global Reach</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your contribution helps communities locally and across the globe, creating lasting positive change.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}