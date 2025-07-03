// src\components\users-section\PayBoxCollection.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const PayBoxCollection: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profile, setProfile] = useState<{ id: number; amountDue: number; name: string; lastPayment: string } | null>(null);
  const [customAmount, setCustomAmount] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [paymentStep, setPaymentStep] = useState<"search" | "details" | "method" | "processing" | "success">("search");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | null>(null);

  const handleSearch = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setSearchError("Please enter a valid 10-digit phone number");
      return;
    }
    
    setIsLoading(true);
    setSearchError("");
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response - replace with actual API call
      if (phoneNumber === "1234567890") {
        setProfile(null);
        setSearchError("No associated Pay-Box found for this number");
      } else {
        setProfile({ 
          id: 1, 
          amountDue: 0, // Set to 0 so user can enter custom amount
          name: "John Doe",
          lastPayment: "2025-01-15"
        });
        setPaymentStep("details");
      }
    } catch (error) {
      console.error("Error searching for profile:", error);
      setSearchError("An error occurred while searching. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setCustomAmount("");
      setAmountError("");
    } else {
      const numValue = parseFloat(value);
      setCustomAmount(numValue);
      
      if (numValue <= 0) {
        setAmountError("Amount must be greater than 0");
      } else {
        setAmountError("");
      }
    }
  };

  const handlePayNow = () => {
    if (customAmount === "" || typeof customAmount !== 'number' || customAmount <= 0) {
      setAmountError("Please enter a valid amount");
      return;
    }
    
    setAmountError("");
    setPaymentStep("method");
  };

  const handleChoosePaymentMethod = (method: "upi" | "card" | "netbanking") => {
    setPaymentMethod(method);
    setPaymentStep("processing");
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentStep("success");
      
      // Reset after a delay
      setTimeout(() => {
        setPaymentStep("search");
        setProfile(null);
        setPhoneNumber("");
        setPaymentMethod(null);
        setCustomAmount("");
      }, 5000);
    }, 2000);
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
    <section className="py-24 px-6 bg-gray-100">
      <div className="container mx-auto max-w-4xl">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block p-2 px-5 bg-indigo-100 rounded-full text-indigo-800 font-medium text-sm mb-3">
            Quick and Easy
          </div>
          <h2 className="text-5xl font-extrabold text-indigo-900 mb-4">Pay-Box Collection</h2>
          <p className="text-xl text-indigo-700 max-w-2xl mx-auto">Easily pay your regular contributions or check your payment status with our simple Pay-Box system.</p>
        </motion.div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {paymentStep === "search" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto"
            >
              <h3 className="text-2xl font-bold text-indigo-900 mb-6 text-center">Find Your Pay-Box</h3>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Enter Phone Number"
                    className={`w-full p-4 pl-12 border ${
                      searchError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-indigo-200 focus:ring-indigo-500 focus:border-indigo-500'
                    } rounded-lg focus:outline-none focus:ring-2 transition-all`}
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setSearchError("");
                    }}
                    maxLength={10}
                    pattern="[0-9]{10}"
                  />
                  <svg className="w-5 h-5 text-indigo-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                
                {searchError && (
                  <p className="text-red-600 text-sm">
                    {searchError}
                  </p>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center"
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </>
                  ) : "Search"
                  }
                </motion.button>
                
                <div className="text-center mt-6">
                  <p className="text-gray-500 text-sm">
                    Enter the phone number associated with your Pay-Box
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          {paymentStep === "details" && profile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto"
            >
              <div className="flex items-center mb-6">
                <button 
                  onClick={() => {
                    setPaymentStep("search");
                    setProfile(null);
                  }}
                  className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <svg className="w-6 h-6 text-indigo-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h3 className="text-2xl font-bold text-indigo-900">
                  Pay-Box Details
                </h3>
              </div>
              
              <div className="bg-indigo-50 p-6 rounded-xl mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-indigo-800 font-medium">Name:</span>
                  <span className="font-bold text-indigo-900">{profile.name}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-indigo-800 font-medium">Phone:</span>
                  <span className="font-bold text-indigo-900">{phoneNumber}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-indigo-800 font-medium">Last Payment:</span>
                  <span className="font-bold text-indigo-900">{new Date(profile.lastPayment).toLocaleDateString()}</span>
                </div>
                
                {/* Custom Amount Input */}
                <div className="mt-4 mb-2">
                  <label className="block text-indigo-800 font-medium mb-2">Enter Payment Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Enter amount"
                      className={`w-full p-4 pl-8 border ${
                        amountError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-indigo-200 focus:ring-indigo-500 focus:border-indigo-500'
                      } rounded-lg focus:outline-none focus:ring-2 transition-all`}
                      value={customAmount}
                      onChange={handleAmountChange}
                      min="1"
                      step="any"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 font-medium">₹</span>
                  </div>
                  {amountError && (
                    <p className="text-red-600 text-sm mt-1">
                      {amountError}
                    </p>
                  )}
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-300"
                onClick={handlePayNow}
                disabled={customAmount === "" || typeof customAmount !== 'number' || customAmount <= 0}
              >
                Pay Now
              </motion.button>
            </motion.div>
          )}
          
          {paymentStep === "method" && profile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto"
              variants={containerVariants}
            >
              <div className="flex items-center mb-6">
                <button 
                  onClick={() => setPaymentStep("details")}
                  className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <svg className="w-6 h-6 text-indigo-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h3 className="text-2xl font-bold text-indigo-900">
                  Choose Payment Method
                </h3>
              </div>
              
              <div className="flex justify-between items-center mb-6 p-4 bg-indigo-50 rounded-lg">
                <span className="font-bold text-indigo-800">Total Amount:</span>
                <span className="text-2xl font-bold text-indigo-900">₹{typeof customAmount === 'number' ? customAmount.toLocaleString() : '0'}</span>
              </div>
              
              <div className="space-y-4">
                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white border border-indigo-200 hover:bg-indigo-50 p-4 rounded-lg transition-all flex items-center"
                  onClick={() => handleChoosePaymentMethod("upi")}
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-indigo-900">UPI Payment</h4>
                    <p className="text-gray-500 text-sm">Pay using Google Pay, PhonePe, Paytm</p>
                  </div>
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
                
                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white border border-indigo-200 hover:bg-indigo-50 p-4 rounded-lg transition-all flex items-center"
                  onClick={() => handleChoosePaymentMethod("card")}
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-indigo-900">Credit/Debit Card</h4>
                    <p className="text-gray-500 text-sm">Pay using Visa, Mastercard, RuPay</p>
                  </div>
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
                
                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white border border-indigo-200 hover:bg-indigo-50 p-4 rounded-lg transition-all flex items-center"
                  onClick={() => handleChoosePaymentMethod("netbanking")}
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-indigo-900">Net Banking</h4>
                    <p className="text-gray-500 text-sm">Pay using your bank account</p>
                  </div>
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          )}
          
          {paymentStep === "processing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto text-center py-8"
            >
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
              </div>
              <h3 className="text-2xl font-bold text-indigo-900 mb-2">Processing Payment</h3>
              <p className="text-gray-600">
                Please wait while we process your payment via {paymentMethod === "upi" ? "UPI" : paymentMethod === "card" ? "Credit/Debit Card" : "Net Banking"}
              </p>
              <p className="text-indigo-600 mt-4">Please do not close this window...</p>
            </motion.div>
          )}
          
          {paymentStep === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto text-center py-8"
            >
              <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-indigo-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-4">
                Your payment of ₹{typeof customAmount === 'number' ? customAmount.toLocaleString() : '0'} has been successfully processed.
              </p>
              <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-indigo-600">Transaction ID:</span>
                  <span className="font-medium text-indigo-900">TXN{Math.floor(Math.random() * 1000000)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-indigo-600">Payment Method:</span>
                  <span className="font-medium text-indigo-900">
                    {paymentMethod === "upi" ? "UPI" : paymentMethod === "card" ? "Credit/Debit Card" : "Net Banking"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-600">Date & Time:</span>
                  <span className="font-medium text-indigo-900">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-4">A receipt has been sent to your registered mobile number.</p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-300"
                onClick={() => {
                  setPaymentStep("search");
                  setProfile(null);
                  setPhoneNumber("");
                  setPaymentMethod(null);
                  setCustomAmount("");
                }}
              >
                Done
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PayBoxCollection;