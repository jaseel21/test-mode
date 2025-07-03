"use client";

import { motion } from "framer-motion";
import { CauseFormData, CauseType } from "./types";
import CauseForm from "./CauseForm";

interface CauseCardProps {
  cause: CauseType;
  isActive: boolean;
  donationAmounts: number[];
  isLoading: boolean;
  onActivate: (id: number) => void;
  onDeactivate: () => void;
  onSubmit: (formData: CauseFormData) => Promise<void>;
}

const CauseCard = ({
  cause,
  isActive,
  donationAmounts,
  isLoading,
  onActivate,
  onDeactivate,
  onSubmit,
}: CauseCardProps) => {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl transition-all duration-300 ${
        isActive
          ? "ring-4 ring-indigo-500 dark:ring-indigo-400 transform scale-[1.02] overflow-visible z-10"
          : "hover:shadow-2xl hover:translate-y-[-5px] overflow-hidden"
      }`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-xl">{cause.icon}</div>
          {isActive && (
            <button
              onClick={onDeactivate}
              className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 transition-colors"
              aria-label="Close donation form"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <h3 className="text-2xl font-bold text-indigo-900 dark:text-indigo-200 mb-2">{cause.name}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{cause.description}</p>

        {!isActive ? (
          <>
            <div className="mb-4">
              <h4 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2">Your donation provides:</h4>
              <ul className="space-y-1">
                {cause.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center text-indigo-600 dark:text-indigo-400">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500 dark:text-green-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onActivate(cause.id)}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-800 dark:hover:to-purple-800 transition-all shadow-md"
            >
              Donate Now
            </motion.button>
          </>
        ) : (
          <CauseForm
            causeId={cause.id}
            donationType={cause.type}
            donationAmounts={donationAmounts}
            isLoading={isLoading}
            onSubmit={onSubmit}
          />
        )}
      </div>
    </motion.div>
  );
};

export default CauseCard;