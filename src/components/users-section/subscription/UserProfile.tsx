import React from 'react';
import { motion } from "framer-motion";
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


interface UserProfileProps {
  user: {
    name: string;
    phoneNumber: string;
    email?: string;
    joinedDate: string;
    totalDonations: number;
  };
}



export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const initial = user.name.charAt(0);

  const router=useRouter()

  const handleLogout = () => {
    signOut({ redirect: false }).then(() => {
          router.push("/subscription");
        });
      }


      const queryString = new URLSearchParams({
        name: user.name,
        phoneNumber: user.phoneNumber,
        email: user.email || '',
        joinedDate: user.joinedDate,
        totalDonations: user.totalDonations.toString(),
      }).toString();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-lg overflow-hidden mb-8 border border-indigo-100/50"
    >
      {/* Glass-like header */}
      <div className="bg-indigo-600/90 backdrop-blur-sm text-white">
        <div className="px-8 py-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold tracking-tight">Profile Dashboard</h2>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="text-sm font-medium flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200"
          >
           <svg
  className="w-4 h-4 mr-2"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
  />
</svg>
            SignOut
          </motion.button>
        </div>
      </div>
      
      <div className="p-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Avatar with animated gradient border */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 blur-sm group-hover:blur transition duration-500"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-100 to-white rounded-full flex items-center justify-center text-indigo-600 text-2xl font-semibold shadow-inner">
              {initial}
            </div>
          </div>
          
          
          <div className="flex-1 min-w-0 mt-4 md:mt-0">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div>
              <Link href={`/subscription/profile?${queryString}`} className="text-sm text-blue-700 underline">Edit Profile
              </Link>
                
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">{user.name}</h3>
                <div className="flex items-center text-sm text-indigo-600 font-medium">
                  <svg className="w-4 h-4 mr-1.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {/* Member since {new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} */}
                </div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0.8 }}
                whileHover={{ scale: 1.03 }}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-3 rounded-xl shadow-md"
              >
                <p className="text-xs uppercase tracking-widest text-white/80 font-medium mb-1">Total Contributions</p>
                <p className="text-2xl font-bold">₹{user.totalDonations.toLocaleString()}</p>
              </motion.div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div 
                whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.1)" }}
                className="space-y-2 bg-white rounded-xl p-4 border border-indigo-100/50 transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center mr-3 text-indigo-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">Phone Number</p>
                    <p className="text-gray-900 font-semibold">{user.phoneNumber}</p>
                  </div>
                </div>
              </motion.div>
              
              {user.email && (
                <motion.div 
                  whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.1)" }}
                  className="space-y-2 bg-white rounded-xl p-4 border border-indigo-100/50 transition-all duration-200"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center mr-3 text-indigo-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">Email</p>
                      <p className="text-gray-900 font-semibold truncate max-w-xs">{user.email}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-indigo-100">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Need help? Contact support</p>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">View Activity</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};