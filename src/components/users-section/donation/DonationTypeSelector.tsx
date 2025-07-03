"use client";

import { motion } from "framer-motion";
import { DonationType } from "@/components/users-section/types";

interface DonationTypeSelectorProps {
  donationTypes: DonationType[];
  selectedType: string;
  onSelectType: (type: string) => void;
}

const DonationTypeSelector = ({
  donationTypes,
  selectedType,
  onSelectType
}: DonationTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-indigo-800 dark:text-indigo-300 font-medium mb-2">Donation Type</label>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {donationTypes.map((type) => (
          <motion.button
            key={type.id}
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectType(type.name)}
            className={`py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
              selectedType === type.name
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {type.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default DonationTypeSelector;