// src/components/users-section/subscription/PaymentHistory.tsx
import React, { useState } from "react";
import {generatePDF} from '@/lib/receipt-pdf'

export interface Payment {
  razorpayOrderId: string;
  _id: string;
  amount: number;
  district: string;
  donorId: string;
  method: string;
  name: string;
  panchayat: string;
  paymentDate: string;
  paymentStatus: string;
  period: string;
  phone: string;
  razorpayPaymentId: string;
  razorpaySubscriptionId: string;
  status: string;
  subscriptionId: string;
  type: string;
}
interface ReceiptData {
  _id: string;
  amount: number;
  name: string;
  phone: string;
  type: string;
  district: string;
  panchayat: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  InstitutionId?: string;
  createdAt: string;
}


interface PaymentHistoryProps {
  paymentHistory: Payment[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  paymentHistory,
  isLoading,
  currentPage,
  totalPages,
  handlePageChange,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
    const [, setDetails] = useState<ReceiptData | null>(null);

  const filteredPayments = paymentHistory.filter((payment) =>
    Object.values(payment).some((value) =>
      String(value)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  );

 async function handleReceiptClick(payment: Payment): Promise<void> {
  const receiptData: ReceiptData = {
    _id: payment._id,
    amount: payment.amount,
    name: payment.name,
    phone: payment.phone, 
    type: payment.type,
    district: payment.district,
    panchayat: payment.panchayat,
    razorpayPaymentId: payment.razorpayPaymentId,
    razorpayOrderId:payment.method === "manual" 
    ? payment.razorpayOrderId 
    : "No orderID for auto payment",
    InstitutionId: payment.subscriptionId,
    createdAt: new Date().toISOString(),
  };

  setDetails(receiptData);   

      await generatePDF(receiptData);
      
    throw new Error("Function not implemented.");
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">Payment History</h3>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredPayments.length > 0 ? (
          <>
            <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-300 bg-white">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Receipt
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {new Date(payment.paymentDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 capitalize">
                        {payment.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                        ₹{payment.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${payment.paymentStatus === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                            }`}
                        >
                          {payment.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {payment.razorpayPaymentId ? (
                          <button
                            onClick={() => handleReceiptClick(payment)}
                            className="text-blue-600 hover:text-blue-800 font-medium underline transition-colors duration-150"
                          >
                            Receipt
                          </button>
                        ) : (
                          <span className="text-gray-500 italic">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h4 className="text-xl font-bold text-gray-700 mb-2">No Payment History</h4>
            <p className="text-gray-600">
              {searchTerm
                ? "No payments match your search."
                : "You haven't made any payments yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};