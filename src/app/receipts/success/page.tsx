"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ReceiptSuccessPage() {
  const router = useRouter();
  
  // Redirect to main receipts page after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/receipts');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <>
      {/* Page Header */}
      <section className="pt-32 pb-12 px-6 bg-gradient-to-r from-indigo-900 to-purple-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">Verification Successful</h1>
          <p className="text-xl text-indigo-200 max-w-3xl">
            Your phone number has been verified successfully.
          </p>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="py-16 px-6 bg-gray-50 min-h-screen">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            className="bg-white rounded-xl shadow-lg overflow-hidden text-center p-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Verification Successful!</h2>
            <p className="text-lg text-gray-600 mb-8">
              You now have access to view and download your donation receipts.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/receipts"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View Your Receipts
              </Link>
              
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Return to Home
              </Link>
            </div>
            
            <p className="text-sm text-gray-500 mt-8">
              You will be redirected to the receipts page in a few seconds...
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}