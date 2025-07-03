import { motion } from "framer-motion";

interface CampaignCounterProps {
  count: number;
}

export function CampaignCounter({ count }: CampaignCounterProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-10 flex justify-center items-center"
    >
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900">
          <span className="text-purple-900 dark:text-purple-200 font-bold text-3xl md:text-4xl">{count}</span>
          <span className="text-indigo-700 dark:text-indigo-300 text-sm font-medium">Active Campaigns</span>
        </div>
        <div className="hidden md:block h-12 w-px bg-gray-200 dark:bg-gray-600"></div>
        <div className="hidden md:block">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Make an Impact Today</h3>
          <p className="text-gray-600 dark:text-gray-400">Browse our campaigns and find ways to contribute</p>
        </div>
      </div>
    </motion.div>
  );
}