"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DonationType } from "@/components/users-section/types";
import { useSearchParams } from "next/navigation";

// Import components
import DonationAmountSelector from "@/components/users-section/donation/DonationAmountSelector";
import DonationForm from "@/components/users-section/donation/DonationForm";
import WhyDonate from "@/components/users-section/donation/WhyDonate";
import DonationThankYou from "@/components/users-section/donation/DonationThankYou";

export default function DonationPage() {
  const searchParams = useSearchParams();

  // Get amount from URL if available
  const urlAmount = searchParams.get("amount");
  const initialAmount = urlAmount ? parseInt(urlAmount) : 0;

  const [donationAmount, setDonationAmount] = useState<number>(initialAmount);
  const [, setIsLoading] = useState(false);
  const [showThanks, setShowThanks] = useState(false);

  // Donation amounts for quick selection
  const donationAmounts = [100, 500, 1000, 10000];

  // Donation types
  const donationTypes: DonationType[] = [
    { id: 1, name: "General" },
    { id: 2, name: "Yatheem" },
    { id: 3, name: "Hafiz" },
    { id: 4, name: "Building" },
  ];

  // Update donation amount if URL parameter changes
  useEffect(() => {
    if (urlAmount) {
      setDonationAmount(parseInt(urlAmount));
    }
  }, [urlAmount]);

  // Reasons for donation
  const donationReasons = [
    {
      title: "Support Education",
      description: "Help provide quality education to underprivileged children.",
      icon: (
        <svg
          className="w-8 h-8 text-indigo-500 dark:text-indigo-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14z" />
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
      title: "Build Community Centers",
      description: "Contribute to construction of essential community facilities.",
      icon: (
        <svg
          className="w-8 h-8 text-indigo-500 dark:text-indigo-400"
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
    {
      title: "Empower Families",
      description: "Help families become self-sufficient through skills training.",
      icon: (
        <svg
          className="w-8 h-8 text-indigo-500 dark:text-indigo-400"
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
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Handle donation form submission
  const handleDonationSubmit = async () => {
    setIsLoading(true);

    try {
      // Simulate API call or process payment (handled by DonationForm)
      // const paymentResult = await new Promise<{ id: string; paymentId: string; orderId: string }>(
      //   (resolve) => setTimeout(() => resolve({ id: "123", paymentId: "pay_abc", orderId: "order_xyz" }), 1500)
      // );

      // const [district, panchayath] = formData.location.split(", ").map((part) => part.trim());

      // // Log form data for debugging
      // console.log("Form Data:", { ...formData, district, panchayath });

      // Redirect to success page with query parameters
      
    } catch (error) {
      console.error("Error submitting donation:", error);
      alert("There was an error processing your donation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Update donation amount from the amount selector
  const handleAmountSelect = (amount: number) => {
    setDonationAmount(amount);
  };

  // Reset the form to make another donation
  const handleStartNewDonation = () => {
    setShowThanks(false);
    setDonationAmount(0);
  };

  // If the thank you screen is shown, display only that
  if (showThanks) {
    return <DonationThankYou onStartNewDonation={handleStartNewDonation} />;
  }

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

          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">General Donation</h1>
          <p className="hidden md:block text-xl text-indigo-200 dark:text-gray-300 max-w-3xl">
            Your contribution helps us continue our mission and impact communities in need.
          </p>
        </div>
      </section>

      {/* Donation Form Section */}
      <section className="py-16 px-6 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Donation Amounts and Why Donate Column */}
            <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
              {/* Amount Selector Component */}
              <DonationAmountSelector
                donationAmounts={donationAmounts}
                selectedAmount={donationAmount}
                onSelectAmount={handleAmountSelect}
              />

              {/* Why Donate Component */}
              <div className="hidden sm:block">
                <WhyDonate reasons={donationReasons} />
              </div>

              {/* Donation stats/achievements card */}
              <motion.div
                className="hidden sm:block bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-200 mb-4">Our Impact</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-xl text-center">
                    <p className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">100+</p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">Projects</p>
                  </div>
                  <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-xl text-center">
                    <p className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">5,000+</p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">Beneficiaries</p>
                  </div>
                  <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-xl text-center">
                    <p className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">95%</p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">Funds Utilized</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Form Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Donation Form Component - Pass the selected amount */}
              <DonationForm
                donationTypes={donationTypes}
                onSubmit={handleDonationSubmit}
                // isLoading={isLoading}
                selectedAmount={donationAmount}
              />
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}