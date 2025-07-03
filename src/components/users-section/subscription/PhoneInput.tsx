// src/components/subscription/PhoneInput.tsx
import { motion } from "framer-motion";

interface PhoneInputProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  handlePhoneSubmit: (e: React.FormEvent) => Promise<void>;
  isVerifying: boolean;
  setUserMode: (mode: "new" | "existing") => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  phoneNumber,
  setPhoneNumber,
  handlePhoneSubmit,
  isVerifying,
  setUserMode
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
          <h2 className="text-2xl font-bold mb-2">Login to Your Account</h2>
          <p className="text-indigo-100">Enter your phone number to access your subscriptions and payment history</p>
        </div>
        
        <form onSubmit={handlePhoneSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">+91</span>
              </div>
              <input
                type="tel"
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Enter your 10-digit mobile number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                pattern="[0-9]{10}"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isVerifying || phoneNumber.length !== 10}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending OTP...
              </span>
            ) : "Send Verification Code"
            }
          </button>
        </form>
        
        <div className="px-6 pb-6 text-center text-gray-500 text-sm">
          By continuing, you agree to our terms and privacy policy.
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} className="text-center">
        <button
          onClick={() => setUserMode("new")}
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          ← I want to create a new subscription
        </button>
      </motion.div>
    </motion.div>
  );
};
