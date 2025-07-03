"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentSuccessModalProps {
  show: boolean;
  onClose: () => void;
  transactionDetails: {
    amount: number;
    transactionId: string;
    paymentMethod: string;
    boxNumber: string;
  };
}

const PaymentSuccessModal = ({ show, onClose, transactionDetails }: PaymentSuccessModalProps) => {
  const [countdown, setCountdown] = useState(5);
  
  // Auto-close countdown
  useEffect(() => {
    if (!show) return;
    
    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/60">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Success confetti animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-10 left-0 w-full h-40 opacity-10">
                <div className="absolute w-2 h-2 rounded-full bg-yellow-500 dark:bg-yellow-400 animate-fall-slow" style={{ left: '10%', animationDelay: '0.2s' }}></div>
                <div className="absolute w-3 h-3 rounded-full bg-red-500 dark:bg-red-400 animate-fall-slow" style={{ left: '20%', animationDelay: '0.5s' }}></div>
                <div className="absolute w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-fall-slow" style={{ left: '30%', animationDelay: '0.7s' }}></div>
                <div className="absolute w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-fall-slow" style={{ left: '40%', animationDelay: '0.3s' }}></div>
                <div className="absolute w-3 h-3 rounded-full bg-purple-500 dark:bg-purple-400 animate-fall-slow" style={{ left: '50%', animationDelay: '0.6s' }}></div>
                <div className="absolute w-2 h-2 rounded-full bg-pink-500 dark:bg-pink-400 animate-fall-slow" style={{ left: '60%', animationDelay: '0.9s' }}></div>
                <div className="absolute w-3 h-3 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-fall-slow" style={{ left: '70%', animationDelay: '0.4s' }}></div>
                <div className="absolute w-2 h-2 rounded-full bg-yellow-500 dark:bg-yellow-400 animate-fall-slow" style={{ left: '80%', animationDelay: '0.7s' }}></div>
                <div className="absolute w-3 h-3 rounded-full bg-red-500 dark:bg-red-400 animate-fall-slow" style={{ left: '90%', animationDelay: '0.2s' }}></div>
              </div>
            </div>
            
            {/* Modal header with success icon */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 p-6 text-white dark:text-gray-100">
              <div className="mx-auto w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                <svg className="w-10 h-10 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-center">Payment Successful!</h3>
            </div>
            
            {/* Modal body with payment details */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 dark:text-gray-400">Amount Paid:</span>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">₹{transactionDetails.amount.toLocaleString()}</span>
              </div>
              
              <div className="space-y-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Box Number:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{transactionDetails.boxNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Transaction ID:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{transactionDetails.transactionId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Payment Method:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{transactionDetails.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Date & Time:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{new Date().toLocaleString()}</span>
                </div>
              </div>
              
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                A receipt has been sent to your registered mobile number
              </p>
              
              <button
                onClick={onClose}
                className="w-full bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white dark:text-gray-100 py-3 rounded-lg transition-colors font-semibold flex items-center justify-center"
              >
                Done (closes in {countdown}s)
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentSuccessModal;