import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  label?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  href = '/',
  onClick,
  label = 'Back'
}) => {
  const buttonContent = (
    <motion.div
      className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
      whileHover={{ x: -3 }}
      whileTap={{ scale: 0.98 }}
    >
      <svg 
        className="w-5 h-5 mr-1" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M10 19l-7-7m0 0l7-7m-7 7h18" 
        />
      </svg>
      {label}
    </motion.div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="mb-4">
        {buttonContent}
      </button>
    );
  }

  return (
    <Link href={href} className="mb-4 inline-block">
      {buttonContent}
    </Link>
  );
};

export default BackButton;