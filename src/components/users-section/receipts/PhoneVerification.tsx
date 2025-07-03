import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface PhoneVerificationProps {
  onSubmit: (phoneNumber: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const PhoneVerification: React.FC<PhoneVerificationProps> = ({ onSubmit, isLoading, error }) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) {
      return;
    }
    
    // Pass only the 10-digit number without +91 prefix
    // The API will handle adding the prefix
    await onSubmit(phoneNumber);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="bg-indigo-600 py-4">
        <h2 className="text-xl font-bold text-center text-white">Verify Your Phone Number</h2>
      </div>
      
      <div className="p-6">
        <p className="text-gray-600 mb-6 text-center">
          Enter your phone number to access your donation receipts
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">+91</span>
              </div>
              <input
                type="tel"
                id="phone"
                className="pl-12 block w-full py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="10-digit number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                maxLength={10}
                pattern="[0-9]{10}"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">We&apos;ll send an OTP to verify this number</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading || phoneNumber.length !== 10}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
              isLoading || phoneNumber.length !== 10
                ? 'bg-indigo-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending OTP...
              </>
            ) : (
              'Send OTP'
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default PhoneVerification;