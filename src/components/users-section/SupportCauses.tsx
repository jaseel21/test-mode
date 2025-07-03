// src\components\users-section\SupportCauses.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
// import { useRouter } from "next/navigation";
import { DonationType } from "./types";

const SupportCauses: React.FC = () => {
  // const router = useRouter();
  const [activeForm, setActiveForm] = useState<number | null>(null);
  const [form, setForm] = useState({ 
    fullName: "", 
    phoneNumber: "", 
    donationType: "", 
    location: "",
    email: "",
    amount: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const causes: (DonationType & { 
    description: string; 
    icon: React.ReactNode;
    benefits: string[];
  })[] = [
    { 
      id: 1, 
      name: "Yatheem", 
      description: "Support orphaned children with care, education, and a loving environment.",
      benefits: ["Food and nutrition", "Quality education", "Healthcare", "Safe housing"],
      icon: (
        <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      id: 2, 
      name: "Hafiz", 
      description: "Support students dedicated to memorizing and understanding religious scripture.",
      benefits: ["Educational materials", "Qualified teachers", "Safe learning environment", "Meals during study"],
      icon: (
        <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      )
    },
    { 
      id: 3, 
      name: "Building Construction", 
      description: "Help construct community buildings, schools, and places of worship.",
      benefits: ["Community centers", "Educational facilities", "Worship spaces", "Water and sanitation"],
      icon: (
        <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
  ];

  const donationAmounts = [100, 500, 1000, 5000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log({
        cause: activeForm !== null ? causes.find(c => c.id === activeForm)?.name : '',
        donorInfo: form
      });
      
      setShowThankYou(true);
      
      // Reset form after delay
      setTimeout(() => {
        setShowThankYou(false);
        setActiveForm(null);
        setForm({ fullName: "", phoneNumber: "", donationType: "", location: "", email: "", amount: 0 });
      }, 3000);
    } catch (error) {
      console.error("Error processing donation:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Animation variants
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
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <section className="py-24 px-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block p-2 px-5 bg-indigo-100 rounded-full text-indigo-800 font-medium text-sm mb-3">
            Choose Your Cause
          </div>
          <h2 className="text-5xl font-extrabold text-indigo-900 mb-4">Support Our Causes</h2>
          <p className="text-xl text-indigo-700 max-w-2xl mx-auto">Your donation to these specific causes creates direct impact where it&apos;s needed most.</p>
        </motion.div>
        
        {/* Thank You Modal */}
        {showThankYou && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50"
          >
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You for Your Support!</h3>
              <p className="text-gray-600 mb-6">Your donation will make a significant impact on this important cause.</p>
              <button 
                onClick={() => setShowThankYou(false)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {causes.map((cause) => (
            <motion.div 
              key={cause.id} 
              variants={itemVariants}
              className={`bg-white rounded-2xl shadow-xl overflow-hidden ${
                activeForm === cause.id ? 'ring-4 ring-indigo-500' : ''
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-indigo-100 p-3 rounded-xl">
                    {cause.icon}
                  </div>
                  {activeForm === cause.id && (
                    <button 
                      onClick={() => setActiveForm(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-indigo-900 mb-2">{cause.name}</h3>
                <p className="text-gray-600 mb-4">{cause.description}</p>
                
                {activeForm !== cause.id && (
                  <>
                    <div className="mb-4">
                      <h4 className="font-medium text-indigo-800 mb-2">Your donation provides:</h4>
                      <ul className="space-y-1">
                        {cause.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center text-indigo-600">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveForm(cause.id)}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-all"
                    >
                      Donate Now
                    </motion.button>
                  </>
                )}
                
                {activeForm === cause.id && (
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                      <label className="block text-indigo-800 font-medium mb-2">Amount</label>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {donationAmounts.map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            className={`p-2 rounded-lg text-center transition-all ${
                              form.amount === amount 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                            }`}
                            onClick={() => setForm({ ...form, amount })}
                          >
                            ₹{amount}
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Custom Amount"
                          className="w-full p-3 pl-8 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          value={form.amount || ''}
                          onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                          min="1"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400">₹</span>
                      </div>
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="w-full p-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      required
                    />
                    
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full p-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={form.phoneNumber}
                      onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                      required
                    />
                    
                    <input
                      type="email"
                      placeholder="Email (Optional)"
                      className="w-full p-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    
                    <input
                      type="text"
                      placeholder="Location (District, Panchayat)"
                      className="w-full p-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      required
                    />
                    
                    <motion.button
                      type="submit"
                      disabled={isLoading || !form.amount || !form.fullName || !form.phoneNumber}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-all disabled:bg-indigo-300 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : "Complete Donation"
                      }
                    </motion.button>
                  </form>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SupportCauses;