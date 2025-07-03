"use client";

import { motion } from "framer-motion";
import { SponsorshipOption } from "./SponsorshipOption";
import { BaseOption, EducationOption } from "../types";

interface SponsorshipCardProps {
  type: string;
  options: (BaseOption | EducationOption)[];
  onSelect: (type: string, option: BaseOption | EducationOption, withEducation?: boolean) => void;
}

export const SponsorshipCard = ({ type, options, onSelect }: SponsorshipCardProps) => {
  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="relative h-44">
        {/* Beautiful wave pattern SVG background */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-purple-900 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
          <svg className="absolute w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
            <path 
              fill="rgba(255, 255, 255, 0.1)" 
              d="M0,192L48,176C96,160,192,128,288,122.7C384,117,480,139,576,165.3C672,192,768,224,864,213.3C960,203,1056,149,1152,117.3C1248,85,1344,75,1392,69.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
            <path 
              fill="rgba(255, 255, 255, 0.05)" 
              d="M0,96L48,112C96,128,192,160,288,170.7C384,181,480,171,576,138.7C672,107,768,53,864,48C960,43,1056,85,1152,96C1248,107,1344,85,1392,74.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
        
        {/* Main content */}
        <div className="absolute inset-0 flex items-center justify-between p-8">
          <div>
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm flex items-center justify-center mr-3 text-white">
                {type === "Yatheem" ? "❤️" : "📚"}
              </div>
              <span className="text-white/80 dark:text-gray-300 text-sm font-medium">Support Program</span>
            </div>
            
            <h3 className="text-3xl font-bold text-white">{type}</h3>
          </div>
          
          <div className="hidden md:block w-24 h-24 rounded-full bg-white/10 dark:bg-gray-900/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 p-1">
            <div className="w-full h-full rounded-full bg-white/10 dark:bg-gray-900/10 flex items-center justify-center">
              <div className="text-white text-4xl transform group-hover:scale-110 transition-transform duration-500">
                {type === "Yatheem" ? "❤️" : "📚"}
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-purple-500/10 dark:bg-purple-400/10"></div>
        <div className="absolute -left-10 bottom-0 w-32 h-32 rounded-full bg-indigo-400/10 dark:bg-indigo-500/10"></div>
      </div>
      
      <div className="p-8">
        <div className="space-y-4">
          {options.map((option, idx) => (
            <SponsorshipOption 
              key={idx}
              option={option}
              index={idx}
              type={type}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};