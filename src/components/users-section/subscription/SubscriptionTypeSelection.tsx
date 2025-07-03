// src/components/subscription/SubscriptionTypeSelection.tsx
import { motion } from "framer-motion";

interface SubscriptionTypeSelectionProps {
  setSubscriptionType: (type: "auto" | "manual") => void;
}

export const SubscriptionTypeSelection: React.FC<SubscriptionTypeSelectionProps> = ({ setSubscriptionType }) => {
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
      className="text-center mb-12"
    >
      <motion.h2 
        variants={itemVariants} 
        className="text-3xl font-bold text-gray-900 mb-4"
      >
        Choose Your Subscription Type
      </motion.h2>
      <motion.p 
        variants={itemVariants} 
        className="text-xl text-gray-600 max-w-2xl mx-auto mb-12"
      >
        Select how you&apos;d like to manage your recurring donation
      </motion.p>
      
      <motion.div 
        variants={itemVariants}
        className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
      >
        <motion.div
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-indigo-500 transition-all"
          onClick={() => setSubscriptionType("auto")}
        >
          <div className="p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Auto Payment</h3>
            <p className="text-gray-600 mb-6 text-center">Automatically process your donation on a regular schedule.</p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Set up once, never worry again
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Regular, uninterrupted support
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Easy to cancel anytime
              </li>
            </ul>
          </div>
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
            <button className="w-full py-3 bg-white text-indigo-700 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all">
              Select Auto Payment
            </button>
          </div>
        </motion.div>
        
        <motion.div
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-indigo-500 transition-all"
          onClick={() => setSubscriptionType("manual")}
        >
          <div className="p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Manual Payment</h3>
            <p className="text-gray-600 mb-6 text-center">Receive reminders to make your donation manually on schedule.</p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Full control over each payment
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Timely reminders via SMS/Email
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Pay only when you want to
              </li>
            </ul>
          </div>
          <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600">
            <button className="w-full py-3 bg-white text-purple-700 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all">
              Select Manual Payment
            </button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};