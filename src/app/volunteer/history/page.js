"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaEye, FaDownload, FaChevronDown, FaChevronUp, FaBoxOpen, FaCalendarAlt, FaMoneyBillWave } from "react-icons/fa";
import { useSession } from "../../../lib/Context/SessionContext";
import { generatePDF } from "@/lib/receipt-pdf";

export default function BoxesPage() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBox, setExpandedBox] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  // Removed unused sortConfig state since the sorting functionality is commented out
  const session = useSession();
  const phone = session.user.phone;

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const response = await fetch(`/api/boxes/volunteer/find-donation?phone=${encodeURIComponent(phone)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch boxes");
        }

        const data = await response.json();

        console.log("conssssssssssssssssssssssssol",data);
        

        if (data.message === "No boxes assigned to you") {
          setBoxes([]);
        } else {
          setBoxes(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBoxes();
  }, [phone]); // Added phone as a dependency

  const handleDownloadReceipt = async (box, donation, e) => {
    e.stopPropagation();
    console.log(box, donation);

    const ReceiptData = {
      _id: donation.id,
      amount: donation.amount,
      name: donation.name,
      phone: donation.phone,
      type: "Box",
      district: donation.district,
      panchayat: donation.panchayat,
      razorpayPaymentId: donation.paymentId,
      razorpayOrderId: donation.orderId,
      instituteId: donation._id,
      createdAt: new Date().toISOString(),
    };

    try {
      await generatePDF(ReceiptData);
      console.log("Receipt downloaded successfully");
    } catch (err) {
      console.error("Error generating receipt:", err);
      setError("Failed to generate receipt. Please try again.");
    }
  };

  const toggleExpand = (boxId) => {
    setExpandedBox(expandedBox === boxId ? null : boxId);
  };

  // Simplified getSortedBoxes since sorting is not being used
  const getSortedBoxes = () => {
    return [...boxes];
  };

  const filteredBoxes = getSortedBoxes().filter(box => 
    (box.name && box.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (box.serialNumber && box.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (box.mobileNumber && box.mobileNumber.includes(searchTerm))
  );

  const totalDonations = boxes.reduce((sum, box) => {
    return sum + box.donations.reduce((boxSum, donation) => boxSum + donation.amount, 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your assigned boxes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Error Loading Boxes</h2>
          <p className="text-center text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Your Assigned Donation Boxes</h1>
          <p className="text-blue-100">Manage and track all your assigned donation boxes and their contributions</p>
          
          {/* Summary stats */}
          {boxes.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-blue-100 text-sm">Total Boxes</p>
                <p className="text-2xl font-bold">{boxes.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-blue-100 text-sm">Total Donations</p>
                <p className="text-2xl font-bold">₹{totalDonations.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-blue-100 text-sm">Paid Boxes</p>
                <p className="text-2xl font-bold">
                  {boxes.filter(box => box.paymentStatus === "Paid").length} / {boxes.length}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!boxes.length ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="flex justify-center mb-4">
              <FaBoxOpen className="w-16 h-16 text-gray-300" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No Boxes Assigned Yet</h3>
            <p className="text-gray-500 mb-6">
              You don&apos;t have any donation boxes assigned to you at the moment.
            </p>
            <Link 
              href="/volunteer/dashboard" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <>
            {/* Search and filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, serial number, or mobile"
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  {filteredBoxes.length} Box{filteredBoxes.length !== 1 ? 'es' : ''} Found
                </h2>
                <p className="text-sm text-gray-500 mt-2 sm:mt-0">
                  Click on a box to view donation details
                </p>
              </div>
              
              {/* Box List */}
              <div className="divide-y divide-gray-200">
                {filteredBoxes.map((box) => (
                  <div key={box._id} className="hover:bg-gray-50">
                    {/* Box header - always visible */}
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => toggleExpand(box._id)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex items-start">
                          <div className="bg-blue-100 rounded-lg p-2 mr-4">
                            <FaBoxOpen className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                              {box.name}
                              <span 
                                className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  box.paymentStatus === "Paid"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {box.paymentStatus} ({box.currentPeriod})
                              </span>
                            </h3>
                            <div className="mt-1 text-sm text-gray-500 flex flex-col sm:flex-row sm:gap-4">
                              <span>Serial: {box.serialNumber}</span>
                              <span>Mobile: {box.mobileNumber}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center mt-4 md:mt-0">
                          <span className="text-sm font-medium text-gray-700 mr-3">
                            {box.donations.length} Donation{box.donations.length !== 1 ? 's' : ''}
                          </span>
                          <Link 
                            href={`/box/${box._id}`} 
                            className="p-2 text-blue-600 hover:text-blue-800 transition-colors mr-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FaEye className="text-lg" />
                          </Link>
                          {expandedBox === box._id ? 
                            <FaChevronUp className="text-gray-400" /> : 
                            <FaChevronDown className="text-gray-400" />
                          }
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded donation history view */}
                    {expandedBox === box._id && (
                      <div className="bg-gray-50 p-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Donation History</h4>
                        {box.donations.length === 0 ? (
                          <p className="text-sm text-gray-500 italic py-2">No donations recorded yet</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {box.donations.map((donation, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                      <div className="flex items-center">
                                        <FaCalendarAlt className="text-gray-400 mr-2" />
                                        {new Date(donation.date).toLocaleDateString()}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                      <div className="flex items-center">
                                        <FaMoneyBillWave className="text-green-500 mr-2" />
                                        ₹{donation.amount.toLocaleString()}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                      {donation.paymentId}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                      <button 
                                        onClick={(e) => handleDownloadReceipt(box, donation, e)}
                                        className="text-green-600 hover:text-green-800 p-1 rounded-md hover:bg-green-50 transition-colors"
                                        title="Download Receipt"
                                      >
                                        <FaDownload className="text-lg" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}