"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface DonationThankYouProps {
  onStartNewDonation: () => void;
}

const DonationThankYou = ({ onStartNewDonation }: DonationThankYouProps) => {
  return (
    <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-4xl">
        <motion.div 
          className="bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-xl text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-indigo-900 dark:text-indigo-200 mb-4">Thank You for Your Donation!</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">Your generous contribution will help make a difference in many lives.</p>
          
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartNewDonation}
              className="bg-indigo-600 dark:bg-indigo-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-300"
            >
              Make Another Donation
            </motion.button>
            
            <Link href="/" className="inline-flex items-center justify-center px-8 py-3 rounded-full border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all duration-300">
              Return to Home
            </Link>
          </div>
          
          <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900 rounded-xl mx-auto max-w-lg">
            <p className="text-indigo-700 dark:text-indigo-200 font-medium">
              An email receipt has been sent to your registered email address. For any inquiries about your donation, please contact us.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DonationThankYou;