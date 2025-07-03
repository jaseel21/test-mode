// src/components/users-section/subscription/UserDashboard.tsx
import React from "react";
import { motion } from "framer-motion";
import { Subscription, SubscriptionData, Payment } from "../types"; // Import Payment instead of PaymentHistory
import { SubscriptionCard } from "./SubscriptionCard";
import { PaymentHistory as PaymentHistoryComponent } from "./PaymentHistory";
import { UserProfile } from "./UserProfile";

interface UserDashboardProps {
  user: {
    name: string;
    phoneNumber: string;
    email?: string;
    joinedDate: string;
    totalDonations: number;
  };
  userSubscriptions: Subscription[];
  paymentHistory: Payment[]; // Changed to Payment[]
  paymentStatus: string;
  isLoading: boolean;
  subscriptionData: SubscriptionData;
  handleMakePayment: (subscription: Subscription) => Promise<void>;
  handleCancelAutoPayment: (subscription: Subscription) => Promise<void>;
  handleCancelManualPayment: (subscription: Subscription) => Promise<void>;
  setLoginStep: (step: "phone" | "otp" | "dashboard") => void;
  setUserMode: (mode: "new" | "existing") => void;
  setSubscriptionType: (type: "auto" | "manual" | null) => void;
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  subscriptionData,
  userSubscriptions,
  paymentHistory,
  paymentStatus,
  isLoading,
  handleMakePayment,
  handleCancelAutoPayment,
  handleCancelManualPayment,
  setUserMode,
  setSubscriptionType,
  currentPage,
  totalPages,
  handlePageChange,
}) => {
  console.log("subscriptionData:", subscriptionData);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto"
    >
      <UserProfile user={user} />
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Subscription Dashboard</h2>
              <p className="text-indigo-100">Manage your subscriptions and view payment history</p>
            </div>
            {subscriptionData.method !== "auto" ? (
              <button
                onClick={async () => {
                  // setLoginStep("phone");
                  // setUserMode("new");
                  await handleCancelManualPayment(subscriptionData as unknown as Subscription);
                }}
                className="bg-white hover:bg-white text-red-500 px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Cancel Subscription
              </button>
            ) : null}
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Your Active Subscriptions</h3>
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : userSubscriptions.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {userSubscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  handleMakePayment={handleMakePayment}
                  paymentStatus={paymentStatus}
                  handleCancelAutoPayment={handleCancelAutoPayment}
                  isLoading={isLoading}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h4 className="text-xl font-bold text-gray-700 mb-2">No Active Subscriptions</h4>
              <p className="text-gray-600 max-w-md mx-auto">
                You don’t have any active subscriptions. Would you like to create a new one?
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setUserMode("new");
                  setSubscriptionType(null);
                }}
                className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all inline-flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Subscription
              </motion.button>
            </div>
          )}
        </div>
      </div>

      <PaymentHistoryComponent
        paymentHistory={paymentHistory}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
      />
    </motion.div>
  );
};