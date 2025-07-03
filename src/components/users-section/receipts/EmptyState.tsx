import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  message: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: 'document' | 'search' | 'notification' | 'data' | 'error';
  variant?: 'primary' | 'warning' | 'success' | 'error' | 'neutral';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  description,
  actionText,
  onAction,
  icon = 'document',
  variant = 'primary'
}) => {
  // Color schemes based on variant
  const colorSchemes = {
    primary: {
      bgLight: 'bg-indigo-50 dark:bg-indigo-900/20',
      bgDark: 'bg-indigo-100 dark:bg-indigo-800/30',
      text: 'text-indigo-600 dark:text-indigo-300',
      buttonBg: 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600',
      buttonText: 'text-white',
      ring: 'focus:ring-indigo-500'
    },
    warning: {
      bgLight: 'bg-amber-50 dark:bg-amber-900/20',
      bgDark: 'bg-amber-100 dark:bg-amber-800/30',
      text: 'text-amber-600 dark:text-amber-300',
      buttonBg: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600',
      buttonText: 'text-white',
      ring: 'focus:ring-amber-500'
    },
    success: {
      bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
      bgDark: 'bg-emerald-100 dark:bg-emerald-800/30',
      text: 'text-emerald-600 dark:text-emerald-300',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600',
      buttonText: 'text-white',
      ring: 'focus:ring-emerald-500'
    },
    error: {
      bgLight: 'bg-rose-50 dark:bg-rose-900/20',
      bgDark: 'bg-rose-100 dark:bg-rose-800/30',
      text: 'text-rose-600 dark:text-rose-300',
      buttonBg: 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600',
      buttonText: 'text-white',
      ring: 'focus:ring-rose-500'
    },
    neutral: {
      bgLight: 'bg-gray-50 dark:bg-gray-800/20',
      bgDark: 'bg-gray-100 dark:bg-gray-700/30',
      text: 'text-gray-600 dark:text-gray-300',
      buttonBg: 'bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600',
      buttonText: 'text-white',
      ring: 'focus:ring-gray-500'
    }
  };

  const colors = colorSchemes[variant];

  // Icon selection
  const icons = {
    document: (
      <svg
        className={`w-10 h-10 ${colors.text}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    search: (
      <svg
        className={`w-10 h-10 ${colors.text}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    notification: (
      <svg
        className={`w-10 h-10 ${colors.text}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
    ),
    data: (
      <svg
        className={`w-10 h-10 ${colors.text}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
    ),
    error: (
      <svg
        className={`w-10 h-10 ${colors.text}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    )
  };

  // Default description text based on whether action exists
  const defaultDescription = actionText && onAction
    ? "Use the button below to adjust your search."
    : "Please check the phone number or make a donation to see receipts here.";

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  // Circular background pattern
  const CirclePattern = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
      <div className={`absolute -top-20 -left-20 w-64 h-64 rounded-full ${colors.bgLight} blur-3xl opacity-40`}></div>
      <div className={`absolute -bottom-20 -right-20 w-64 h-64 rounded-full ${colors.bgLight} blur-3xl opacity-40`}></div>
    </div>
  );

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center py-16 px-4 text-center rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <CirclePattern />
      
      <motion.div 
        className={`${colors.bgDark} p-5 rounded-full mb-6 relative`}
        variants={itemVariants}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-black/5 dark:from-white/5 dark:to-black/10"></div>
        <div className="relative">
          {icons[icon]}
        </div>
      </motion.div>
      
      <motion.h3 
        className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3"
        variants={itemVariants}
      >
        {message}
      </motion.h3>
      
      <motion.p 
        className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6"
        variants={itemVariants}
      >
        {description || defaultDescription}
      </motion.p>
      
      {actionText && onAction && (
        <motion.button
          onClick={onAction}
          className={`mt-2 inline-flex items-center px-6 py-3 rounded-full shadow-md ${colors.buttonBg} ${colors.buttonText} font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.ring} transition-all transform hover:scale-105 active:scale-95`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          variants={itemVariants}
        >
          {actionText}
        </motion.button>
      )}
      
      {/* Additional decorative elements */}
      <motion.div 
        className="absolute top-5 right-5 w-2 h-2 rounded-full bg-gradient-to-r from-white to-gray-200 dark:from-gray-600 dark:to-gray-700"
        variants={itemVariants}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      <motion.div 
        className="absolute bottom-5 left-5 w-3 h-3 rounded-full bg-gradient-to-r from-white to-gray-200 dark:from-gray-600 dark:to-gray-700"
        variants={itemVariants}
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 0.5
        }}
      />
    </motion.div>
  );
};

export default EmptyState;