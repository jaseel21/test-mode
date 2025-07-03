"use client";

import { motion } from "framer-motion";

interface UserData {
  name: string;
  phoneNumber: string;
  email?: string;
  address?: string;
}

interface UserProfileProps {
  userData: UserData;
  onEditProfile?: () => void;
  totalAmount?: number;
}

const UserProfile = ({ userData, totalAmount }: UserProfileProps) => {
  // Format phone number with proper spacing
  const formatPhoneNumber = (phone: string) => {
    if (phone.length === 13) {
      return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
    }
    return phone;
  };

  return (
    <motion.div 
      className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 p-6 text-white dark:text-gray-100">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full bg-white/20 dark:bg-gray-700/20 backdrop-blur-sm flex items-center justify-center mr-5 shadow-lg border-2 border-white/30 dark:border-gray-600/30">
            <span className="text-2xl font-bold text-white dark:text-gray-100">
              {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-1">{userData.name}</h3>
            <p className="text-indigo-100 dark:text-gray-300 flex items-center">
              <svg className="w-4 h-4 mr-1 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {formatPhoneNumber(userData.phoneNumber)}
            </p>
          </div>
          <motion.div 
            initial={{ opacity: 0.8 }}
            whileHover={{ scale: 1.03 }}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 text-white dark:text-gray-100 px-4 py-3 rounded-xl shadow-md"
          >
            <p className="text-xs uppercase tracking-widest text-white/80 dark:text-gray-200/80 font-medium mb-1">Total Contributions</p>
            <p className="text-2xl font-bold">₹{totalAmount}</p>
          </motion.div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userData.email && (
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h5 className="font-medium text-gray-500 dark:text-gray-400 text-sm mb-1">Email</h5>
                <p className="text-gray-900 dark:text-gray-100 font-medium">{userData.email}</p>
              </div>
            </div>
          )}
          
          {userData.address && (
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h5 className="font-medium text-gray-500 dark:text-gray-400 text-sm mb-1">Address</h5>
                <p className="text-gray-900 dark:text-gray-100 font-medium">{userData.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile;