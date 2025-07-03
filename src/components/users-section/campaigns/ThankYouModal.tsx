import { motion } from "framer-motion";

interface ThankYouModalProps {
  show: boolean;
  onClose: () => void;
}

export function ThankYouModal({ show, onClose }: ThankYouModalProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 dark:bg-black/70 backdrop-blur-sm"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-md w-full text-center border border-purple-200/50 dark:border-purple-700/50">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-200 mb-2">Thank You for Your Support!</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-6">Your contribution will make a real difference.</p>
        <button
          onClick={onClose}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all font-medium"
        >
          Close
        </button>
      </div>
    </motion.div>
  );
}