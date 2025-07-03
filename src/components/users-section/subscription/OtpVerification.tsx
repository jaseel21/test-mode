// src/components/subscription/OtpVerification.tsx
import { motion } from "framer-motion";

interface OtpVerificationProps {
  phoneNumber: string;
  otpInput: string[];
  setOtpInput: (otp: string[]) => void;
  handleOtpChange: (index: number, value: string) => void;
  handleOtpKeyDown: (index: number, e: React.KeyboardEvent) => void;
  handleVerifyOtp: (e: React.FormEvent) => Promise<void>;
  isVerifying: boolean;
  otpError: string;
  setLoginStep: (step: "phone" | "otp" | "dashboard") => void;
}

export const OtpVerification: React.FC<OtpVerificationProps> = ({
  phoneNumber,
  otpInput,
  handleOtpChange,
  handleOtpKeyDown,
  handleVerifyOtp,
  isVerifying,
  otpError,
  setLoginStep
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 150 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-md mx-auto"
    >
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Verify Your Phone</h2>
          <p className="text-indigo-100">
            We&apos;ve sent a verification code to <span className="font-medium">+91 {phoneNumber}</span>
          </p>
        </div>
        
        <form onSubmit={handleVerifyOtp} className="p-6">
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-4 text-center">
              Enter 6-digit verification code
            </label>
            <div className="flex justify-center space-x-2">
              {otpInput.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                />
              ))}
            </div>
            {otpError && (
              <p className="mt-2 text-red-600 text-center text-sm">{otpError}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isVerifying || otpInput.some(digit => !digit)}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : "Verify & Continue"
            }
          </button>
        </form>
        
        <div className="px-6 pb-6 text-center">
          <p className="text-gray-600 mb-2">Didn&apos;t receive the code?</p>
          <button 
            className="text-indigo-600 hover:text-indigo-800 font-medium"
            onClick={() => {
              // Resend OTP logic
              alert("New OTP sent");
            }}
          >
            Resend Code
          </button>
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} className="text-center">
        <button 
          onClick={() => setLoginStep("phone")}
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          ← Back to Phone Entry
        </button>
      </motion.div>
    </motion.div>
  );
};