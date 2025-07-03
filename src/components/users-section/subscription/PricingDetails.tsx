import React from 'react';
import { FaHandHoldingHeart, FaLock, FaReceipt, FaCheckCircle } from 'react-icons/fa';

const PricingDetails: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Flexible Donation Model
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We believe in making it easy for anyone to contribute to causes they care about. 
            That&apos;s why we don&apos;t use fixed pricing or subscription plans.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all hover:scale-105 duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <FaHandHoldingHeart className="text-indigo-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Flexible, Donation-Based Payments</h3>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Contribute any custom amount you wish
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                No predefined packages, tiers, or pricing levels
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Choose between one-time or recurring contributions
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Select your preferred donation frequency
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all hover:scale-105 duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <FaLock className="text-indigo-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Secure Payments with Razorpay</h3>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                All transactions are securely processed through Razorpay
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Support for multiple payment methods including UPI, cards, and net banking
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Payment confirmation and receipts sent instantly
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                State-of-the-art encryption for all transactions
              </li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all hover:scale-105 duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <FaReceipt className="text-indigo-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">No Additional Platform Charges</h3>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                We do not charge donors any extra fees
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                100% of your donation amount goes directly to support the cause
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Only standard payment processing fees apply
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Full transparency on where your money goes
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all hover:scale-105 duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <FaCheckCircle className="text-indigo-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Transparency and Freedom</h3>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                See the exact amount before making the payment
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Detailed donation history in your dashboard
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Easy management of recurring donations
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Simple sign-up process with just your phone number
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-block rounded-full bg-indigo-600 text-white px-8 py-4 font-semibold text-lg shadow-lg hover:bg-indigo-700 transition-colors cursor-pointer">
            Start Making a Difference Today
          </div>
          <p className="text-gray-500 mt-4">
            Every contribution, no matter how small, makes a meaningful impact.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingDetails;