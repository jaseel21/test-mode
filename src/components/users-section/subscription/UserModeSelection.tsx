// src/components/subscription/UserModeSelection.tsx
import { motion } from "framer-motion";

interface UserModeSelectionProps {
  userMode: "new" | "existing";
  setUserMode: (mode: "new" | "existing") => void;
  setLoginStep: (step: "phone" | "otp" | "dashboard") => void;
}

export const UserModeSelection: React.FC<UserModeSelectionProps> = ({ 
  userMode, 
  setUserMode,
  setLoginStep
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12 bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto"
    >
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Choose an Option</h2>
        <p className="text-indigo-100">New or returning donor? Select the appropriate option below.</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-0">
        <button
          onClick={() => setUserMode("new")}
          className={`p-8 text-left focus:outline-none transition-all ${
            userMode === "new" 
              ? "bg-indigo-50 border-b-2 md:border-b-0 md:border-r-2 border-indigo-500" 
              : "bg-white hover:bg-gray-50 border-b-2 md:border-b-0 md:border-r-2 border-gray-200"
          }`}
        >
          <div className="w-12 h-12 mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">New Subscription</h3>
          <p className="text-gray-600">I want to set up a new recurring donation and support your cause.</p>
        </button>
        
        <button
          onClick={() => {
            setUserMode("existing");
            setLoginStep("phone");
          }}
          className={`p-8 text-left focus:outline-none transition-all ${
            userMode === "existing" 
              ? "bg-purple-50 border-purple-500" 
              : "bg-white hover:bg-gray-50 border-gray-200"
          }`}
        >
          <div className="w-12 h-12 mb-4 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Existing Subscriber</h3>
          <p className="text-gray-600">I already have a subscription and want to manage it or view my payment history.</p>
        </button>
      </div>
    </motion.div>
  );
};