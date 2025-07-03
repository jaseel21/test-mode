"use client";

import { motion } from "framer-motion";
import { BaseOption, EducationOption } from "../types";

interface SponsorshipOptionProps {
  option: BaseOption | EducationOption;
  index: number;
  type: string;
  onSelect: (type: string, option: BaseOption | EducationOption, withEducation?: boolean) => void;
}

export const SponsorshipOption = ({ option, index, type, onSelect }: SponsorshipOptionProps) => {
  // Type guard function to check if option has education
  const hasEducation = (opt: BaseOption): opt is EducationOption => {
    return 'withEducation' in opt;
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 group/option relative"
    >
      {/* Professional badge for top option */}
      {index === 0 && (
        <div className="absolute -top-3 right-4 bg-indigo-900 dark:bg-indigo-600 text-white text-xs font-medium py-1 px-3 rounded-full shadow-sm">
          Most Popular
        </div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-indigo-900 dark:text-gray-100 text-xl mb-1">{option.duration}</h4>
          <div className="text-indigo-900 dark:text-gray-300 text-sm font-medium">
            {index === 0 ? "Complete Support Package" : index === 1 ? "Medium-term Solution" : "Entry-level Support"}
          </div>
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 dark:bg-gray-700 text-indigo-900 dark:text-gray-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      
      <div className="mb-5">
        <p className="text-indigo-900 dark:text-gray-300 leading-relaxed">{option.description}</p>
      </div>
      
      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full bg-white dark:bg-gray-800 border-2 border-indigo-900 dark:border-indigo-400 text-indigo-900 dark:text-gray-100 font-medium px-4 py-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
            onClick={() => onSelect(type, option)}
          >
            <span className="text-sm">Standard Sponsorship</span>
            <span className="font-bold text-lg">₹{option.amount.toLocaleString()}</span>
          </motion.button>
          
          {hasEducation(option) && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-indigo-900 dark:bg-indigo-600 text-white font-medium px-4 py-3 rounded-lg hover:bg-purple-900 dark:hover:bg-indigo-500 transition-colors flex items-center justify-between"
              onClick={() => onSelect(type, option, true)}
            >
              <div className="flex items-center">
                <span className="text-sm">With Education</span>
                <span className="ml-2 bg-purple-900 dark:bg-purple-500 text-xs text-white px-2 py-0.5 rounded">Recommended</span>
              </div>
              <span className="font-bold text-lg">₹{option.withEducation.toLocaleString()}</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};