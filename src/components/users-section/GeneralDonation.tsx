// src\components\users-section\GeneralDonation.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
// import { useRouter } from "next/navigation";
import { DonationType } from "./types";

const GeneralDonation: React.FC = () => {
  // const router = useRouter();
  const [form, setForm] = useState({ 
    fullName: "", 
    phoneNumber: "", 
    donationType: "", 
    location: "",
    amount: 0,
    email: "",
    message: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  
  const donationAmounts = [100, 313, 786, 1000];
  const donationTypes: DonationType[] = [
    { id: 1, name: "General" },
    { id: 2, name: "Yatheem" },
    { id: 3, name: "Hafiz" },
    { id: 4, name: "Building" },
  ];

  const handleDonateClick = (amount: number) => {
    setForm(prev => ({ ...prev, amount }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(form);
      setShowThanks(false);
      // Optionally redirect after delay
      // setTimeout(() => router.push("/thank-you"), 2000);
    } catch (error) {
      console.error("Error submitting donation:", error);
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

  if (showThanks) {
    return (
      <section className="py-24 px-6 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            className="bg-white p-12 rounded-3xl shadow-xl text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-indigo-900 mb-4">Thank You for Your Donation!</h2>
            <p className="text-xl text-gray-600 mb-8">Your generous contribution will help make a difference in many lives.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowThanks(false)}
              className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition-all duration-300"
            >
              Make Another Donation
            </motion.button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6 bg-gradient-to-r from-indigo-50 to-purple-50">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block p-2 px-5 bg-indigo-100 rounded-full text-indigo-800 font-medium text-sm mb-3">
            Make a Difference Today
          </div>
          <h2 className="text-5xl font-extrabold text-indigo-900 mb-4">General Donation</h2>
          <p className="text-xl text-indigo-700 max-w-2xl mx-auto">Your contribution helps us continue our mission and impact communities in need.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Donation Amounts Column */}
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg"
              variants={itemVariants}
            >
              <h3 className="text-2xl font-bold text-indigo-900 mb-6">Select Amount</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {donationAmounts.map((amount) => (
                  <motion.button
                    key={amount}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`bg-gradient-to-r ${
                      form.amount === amount 
                        ? "from-indigo-600 to-purple-600 text-white" 
                        : "from-indigo-50 to-indigo-100 text-indigo-700 hover:from-indigo-100 hover:to-indigo-200"
                    } text-xl font-bold px-6 py-5 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center`}
                    onClick={() => handleDonateClick(amount)}
                  >
                    ₹ {amount.toLocaleString()}
                  </motion.button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Enter Custom Amount"
                  className="w-full p-4 pl-8 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                  min="1"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 font-medium">₹</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg"
              variants={itemVariants}
            >
              <h3 className="text-2xl font-bold text-indigo-900 mb-6">Why Donate?</h3>
              <div className="space-y-4">
                {[
                  {
                    title: "Support Education",
                    description: "Help provide quality education to underprivileged children.",
                    icon: (
                      <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                      </svg>
                    )
                  },
                  {
                    title: "Build Community Centers",
                    description: "Contribute to construction of essential community facilities.",
                    icon: (
                      <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    )
                  },
                  {
                    title: "Empower Families",
                    description: "Help families become self-sufficient through skills training.",
                    icon: (
                      <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-all">
                    <div className="flex-shrink-0 mr-4">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-800">{item.title}</h4>
                      <p className="text-indigo-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
          
          {/* Form Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-bold text-indigo-900 mb-6">Donor Information</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-indigo-800 font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full p-4 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-indigo-800 font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    className="w-full p-4 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-indigo-800 font-medium mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full p-4 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-indigo-800 font-medium mb-2">Donation Type</label>
                  <select
                    className="w-full p-4 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none bg-no-repeat bg-right"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236366F1'%3E%3Cpath strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundSize: "1.5rem",
                      paddingRight: "3rem"
                    }}
                    value={form.donationType}
                    onChange={(e) => setForm({ ...form, donationType: e.target.value })}
                    required
                  >
                    <option value="">Select Donation Type</option>
                    {donationTypes.map((type) => (
                      <option key={type.id} value={type.name}>{type.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-indigo-800 font-medium mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="District, Panchayat"
                    className="w-full p-4 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-indigo-800 font-medium mb-2">Message (Optional)</label>
                  <textarea
                    placeholder="Add a personal message or note"
                    rows={3}
                    className="w-full p-4 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  ></textarea>
                </div>
              </div>
              
              <motion.button
                type="submit"
                disabled={isLoading || !form.amount || !form.fullName || !form.phoneNumber || !form.donationType}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : "Donate Now"
                }
              </motion.button>
              
              <div className="mt-6 flex items-center justify-center">
                <div className="bg-indigo-50 p-3 rounded-full mr-3">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">
                  Your payment information is secured with industry-standard encryption
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GeneralDonation;