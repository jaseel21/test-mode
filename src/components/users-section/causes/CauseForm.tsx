"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CauseFormData } from "./types";
import LocationSelector from "../LocationSelector";

interface CauseFormProps {
  causeId: number;
  donationType: "Yatheem" | "Hafiz" | "Building";
  donationAmounts: number[];
  isLoading: boolean;
  onSubmit: (formData: CauseFormData) => Promise<void>;
}

const CauseForm = ({ donationType, donationAmounts, isLoading, onSubmit }: CauseFormProps) => {
  const [form, setForm] = useState<CauseFormData>({
    fullName: "",
    phoneNumber: "",
    donationType: donationType,
    email: "",
    location: "",
    amount: 0,
  });

  useEffect(() => {
    setForm((prev) => ({ ...prev, donationType }));
  }, [donationType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmountClick = (amount: number) => {
    setForm((prev) => ({ ...prev, amount }));
  };

  const handleLocationChange = (location: string) => {
    setForm((prev) => ({ ...prev, location }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 mt-5">
      <div className="p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
        <label className="block text-indigo-800 dark:text-indigo-200 font-medium mb-2">Donation Amount</label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {donationAmounts.map((amount) => (
            <motion.button
              key={amount}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-lg text-center transition-all ${
                form.amount === amount
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 text-white shadow-md"
                  : "bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-700"
              }`}
              onClick={() => handleAmountClick(amount)}
            >
              ₹{amount.toLocaleString()}
            </motion.button>
          ))}
        </div>
        <div className="relative">
          <input
            type="number"
            name="amount"
            placeholder="Custom Amount"
            className="w-full p-3 pl-8 border border-indigo-200 dark:border-indigo-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={form.amount || ""}
            onChange={handleInputChange}
            min="1"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 dark:text-indigo-300">₹</span>
        </div>
      </div>

      <div>
        <label className="block text-indigo-800 dark:text-indigo-200 font-medium mb-2">Full Name</label>
        <input
          type="text"
          name="fullName"
          placeholder="Enter your full name"
          className="w-full p-3 border border-indigo-200 dark:border-indigo-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          value={form.fullName}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <label className="block text-indigo-800 dark:text-indigo-200 font-medium mb-2">Phone Number</label>
        <input
          type="tel"
          name="phoneNumber"
          placeholder="Enter your phone number"
          className="w-full p-3 border border-indigo-200 dark:border-indigo-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          value={form.phoneNumber}
          onChange={handleInputChange}
          pattern="[0-9]{10}"
          required
        />
      </div>

      <div>
        <label className="block text-indigo-800 dark:text-indigo-200 font-medium mb-2">Email (Optional)</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email address"
          className="w-full p-3 border border-indigo-200 dark:border-indigo-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          value={form.email}
          onChange={handleInputChange}
        />
      </div>

      <LocationSelector selectedLocation={form.location} onLocationChange={handleLocationChange} />

      <motion.button
        type="submit"
        disabled={isLoading || !form.amount || !form.fullName || !form.phoneNumber || !form.location}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-800 dark:hover:to-purple-800 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          "Complete Donation"
        )}
      </motion.button>
    </form>
  );
};

export default CauseForm;