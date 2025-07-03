// src/components/subscription/SubscriptionCard.tsx
import React from 'react';
import { motion } from "framer-motion";
import { Subscription as SubType } from "./types";

interface SubscriptionCardProps {
  subscription: SubType;
  handleMakePayment: (subscription: SubType) => Promise<void>;
  paymentStatus: string;
  handleCancelAutoPayment: (subscription: SubType) => Promise<void>;
  isLoading: boolean;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  handleMakePayment,
  paymentStatus,
  handleCancelAutoPayment,
  isLoading

}) => {


  return (
    <div>

    <div
      className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className={`px-6 py-4 ${
        subscription.type === "auto" ? "bg-indigo-50 border-b border-indigo-100" : "bg-purple-50 border-b border-purple-100"
      }`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
              subscription.type === "auto" ? "bg-indigo-100" : "bg-purple-100"
            }`}>
              {subscription.type === "auto" ? (
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <h4 className="font-bold text-gray-900">{subscription.donationType}</h4>
              <p className="text-sm text-gray-600">{subscription.type === "auto" ? "Auto Payment" : "Manual Payment"}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-gray-900">₹{subscription.amount}</span>
            <p className="text-sm text-gray-600">{subscription.period}</p>
            
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between mb-4">
          <div className="text-gray-600 text-sm">
            <strong>Last Payment:</strong><br/>
            {new Date(subscription.lastPaymentDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
{/*          
          <div className="text-gray-600 text-sm">
            <p>Next Due On:</p>
            {new Date(subscription.nextPaymentDue).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div> */}
          
          <div className="text-right text-sm">
            <span className={`px-2 py-1 rounded-full text-xs font-medium $text-sm ${paymentStatus === "paid" 
                ?  "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800" 
            }`}>
              {/* {new Date(subscription.nextPaymentDue) <= new Date() ? "Due Now" : "Upcoming"} */}
             {paymentStatus}
            </span>
          </div>
        </div>
        
        {subscription.type === "manual" ? (
          <div>
           
          <motion.button
            onClick={() => handleMakePayment(subscription)}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-70"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <>
              
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Make Payment Now
              </>
            )}
          </motion.button>

          

          
          </div>
          
        ) : (
          <motion.button
            onClick={() => handleCancelAutoPayment(subscription)}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full border border-red-500 text-red-600 py-3 rounded-lg font-medium hover:bg-red-50 transition-all flex items-center justify-center disabled:opacity-70"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel Auto Payment
              </>
            )}
          </motion.button>
        )}
      </div>
      
    </div>
    
    </div>
  );
};