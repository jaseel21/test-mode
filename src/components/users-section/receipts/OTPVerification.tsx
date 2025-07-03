import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface OTPVerificationProps {
  phoneNumber: string;
  onVerify: (otp: string) => Promise<void>;
  onResendOTP: () => Promise<void>;
  onChangePhone: () => void;
  isLoading: boolean;
  error: string | null;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  phoneNumber,
  onVerify,
  onResendOTP,
  onChangePhone,
  isLoading,
  error
}) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  // Fix: Properly type the ref array with MutableRefObject
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Set focus on first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    
    // Only allow digits
    if (value && !/^\d+$/.test(value)) return;
    
    // Update the OTP array
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only the last character
    setOtp(newOtp);
    
    // Auto-focus next input with null check
    if (value && index < 5 && inputRefs.current[index + 1]) {
      // Fix: Add null check before calling focus()
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Handle backspace - clear current and focus previous
    if (e.key === 'Backspace') {
      if (index > 0 && !otp[index] && inputRefs.current[index - 1]) {
        // Fix: Add null check before calling focus()
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) return;
    await onVerify(otpValue);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="bg-indigo-600 py-4">
        <h2 className="text-xl font-bold text-center text-white">Verify OTP</h2>
      </div>
      
      <div className="p-6">
        <p className="text-gray-600 mb-2 text-center">
          We&apos;ve sent a 6-digit code to
        </p>
        <p className="text-indigo-800 font-medium text-center mb-6">
          +91 {phoneNumber}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                // Fix: Use the correct ref callback syntax for arrays
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                maxLength={1}
                className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                id={`otp-${index}`}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            ))}
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading || otp.join('').length !== 6}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
              isLoading || otp.join('').length !== 6
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
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </button>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onChangePhone}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Change Phone Number
            </button>
            <button
              type="button"
              onClick={onResendOTP}
              disabled={isLoading}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Resend OTP
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default OTPVerification;