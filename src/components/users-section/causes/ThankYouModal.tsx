"use client";

import { motion } from "framer-motion";

interface ThankYouModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ThankYouModal = ({ isVisible, onClose }: ThankYouModalProps) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 dark:bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full"
      >
        <div className="text-center">
          <div className="w-24 h-24 mx-auto relative">
            <div className="absolute inset-0 rounded-full bg-green-500/20 dark:bg-green-400/20 animate-ping"></div>
            <div className="relative w-full h-full bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-6 mb-2">Thank You for Your Support!</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Your donation will make a significant impact on this important cause.</p>

          <div className="p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg text-left mb-6">
            <p className="text-indigo-700 dark:text-indigo-300 text-sm">
              <span className="font-medium">What happens next?</span> You&apos;ll receive a confirmation email and receipt for your records. Your contribution will be directed to the selected cause.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 text-white px-8 py-3 rounded-full font-medium hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-800 dark:hover:to-purple-800 transition-all shadow-md"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ThankYouModal;