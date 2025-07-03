"use client";

import { motion } from "framer-motion";
import { SponsorshipCard } from "./SponsorshipCard";
import { BaseOption, EducationOption } from "../types";

interface SponsorshipSelectorProps {
  sponsorships: Record<string, (BaseOption | EducationOption)[]>;
  onSelect: (type: string, option: BaseOption | EducationOption, withEducation?: boolean) => void;
}

export const SponsorshipSelector = ({ sponsorships, onSelect }: SponsorshipSelectorProps) => {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {Object.entries(sponsorships).map(([type, options]) => (
        <SponsorshipCard 
          key={type}
          type={type}
          options={options}
          onSelect={onSelect}
        />
      ))}
    </motion.div>
  );
};