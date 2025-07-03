"use client";

import { motion } from "framer-motion";

interface Reason {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface WhyDonateProps {
  reasons: Reason[];
}

const WhyDonate = ({ reasons }: WhyDonateProps) => {
  // Animation variants
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
      variants={itemVariants}
    >
      <h3 className="text-2xl font-bold text-indigo-900 dark:text-indigo-200 mb-6">Why Donate?</h3>
      <div className="space-y-4">
        {reasons.map((item, index) => (
          <motion.div 
            key={index} 
            className="flex items-start p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900 hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-all"
            whileHover={{ y: -5, x: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex-shrink-0 mr-4">
              {item.icon}
            </div>
            <div>
              <h4 className="font-bold text-indigo-800 dark:text-indigo-200">{item.title}</h4>
              <p className="text-indigo-600 dark:text-indigo-400">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default WhyDonate;