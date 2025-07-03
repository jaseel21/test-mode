"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowLeft, User, AlertCircle, RefreshCcw, ChevronLeft, ChevronRight,
  Eye, Clock, X, Calendar, CreditCard, Download, BarChart3, Info, 
  CheckCircle, XCircle, AlertTriangle, FileText, Repeat, ArrowUpRight,
  Phone
} from "lucide-react";

export default function SubscriptionDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const donorId = searchParams.get("donorId");
  const subscriptionId = searchParams.get("subscriptionId");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [donations, setDonations] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/subscriptions/details?donorId=${donorId}&subscriptionId=${subscriptionId}`,{
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch subscription details");
        const data = await response.json();
        setSubscription(data.subscription);
        setDonations(data.donations);
        setTotalAmount(data.totalAmount);
      } catch (error) {
        console.error("Error loading details:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (donorId && subscriptionId) fetchDetails();
  }, [donorId, subscriptionId]);

  const viewDonationDetails = (donation) => {
    setSelectedDonation(donation);
  };

  const fetchTrackingData = async (donationId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/donations/${donationId}/tracking`,{
        headers: {
          'x-api-key':process.env.NEXT_PUBLIC_API_KEY,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch tracking data");
      const data = await response.json();
      setTrackingData(data);
    } catch (error) {
      console.error("Error fetching tracking data:", error);
      setError("Failed to fetch tracking data");
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedDonation(null);
    setTrackingData(null);
  };

  const handleCancelManualPayment = async () => {
    toast(
      <div className="text-center p-1">
        <div className="bg-red-50 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
          <X className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Cancel Subscription?</h2>
        <p className="text-sm text-gray-600 mb-3">This action cannot be undone and will stop all future payments.</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => toast.dismiss()}
            className="px-4 py-1.5 bg-gray-100 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 transition-colors"
            disabled={isLoading}
          >
            Keep Subscription
          </button>
          <button
            onClick={async () => {
              setIsLoading(true);
              try {
                const response = await fetch(`/api/subscriptions/cancel?subscriptionId=${subscription._id}`, {
                  method: "DELETE",
                  headers: {
                    'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
                  },
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || "Failed to cancel subscription");
                }

                await signOut({ redirect: false });
                router.push("/admin/subscriptions/list");
                toast.success("Subscription canceled successfully");
              } catch (error) {
                console.error("Error canceling subscription:", error);
                toast.error("Failed to cancel subscription");
              } finally {
                setIsLoading(false);
                toast.dismiss();
              }
            }}
            className="px-4 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-colors flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Canceling...
              </>
            ) : "Cancel Subscription"}
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
        position: "top-center",
        className: "max-w-xs shadow-lg rounded-lg",
        style: { background: "white" },
      }
    );
  };

  const handleCancelAutoPayment = async () => {
    toast(
      <div className="text-center p-4">
        <div className="bg-red-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <p className="text-lg font-semibold mb-2">Cancel Automatic Payments?</p>
        <p className="mb-4 text-gray-600">This will stop all future payments from being automatically charged to your payment method.</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={async () => {
              setIsLoading(true);
              try {
                const response = await fetch("/api/cancel-subscription", {
                  method: "POST",
                  headers: { "Content-Type": "application/json",
                    'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
                   },
                  body: JSON.stringify({ subscriptionId: subscription.razorpaySubscriptionId }),
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || "Unknown error");
                }

                await signOut({ redirect: false });
                router.push("/admin/subscriptions/list");
                toast.success("Auto payment cancelled successfully!", { position: "top-center" });
              } catch (error) {
                console.error("Error cancelling auto payment:", error);
                toast.error(`Failed to cancel subscription: ${error.message || "Unknown error"}`, { position: "top-center" });
              } finally {
                setIsLoading(false);
                toast.dismiss();
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : "Yes, Cancel"}
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md font-medium hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            disabled={isLoading}
          >
            No, Keep Subscription
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
        position: "top-center",
        className: "max-w-md shadow-lg rounded-lg",
        style: { background: "white" },
      }
    );
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDonations = donations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(donations.length / itemsPerPage);

  const formatDate = (dateString) => {
    if (typeof window === "undefined") return dateString;
    return new Date(dateString).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading && !subscription) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin w-12 h-12 border-4 border-t-emerald-500 border-emerald-100 rounded-full mb-4"></div>
          <p className="text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center mx-auto"
          >
            <RefreshCcw className="h-4 w-4 mr-2" /> Retry Loading
          </button>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <Info className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Subscription Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the subscription you're looking for.</p>
          <Link href="/admin/subscriptions" className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Subscriptions
          </Link>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 p-6">
                <h3 className="text-lg font-medium text-gray-800">Subscription Information</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Donor ID</label>
                    <p className="text-gray-800 mt-1 font-medium">{subscription.donorId || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-gray-800 mt-1 font-medium">{subscription.name || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-800 mt-1 font-medium">{subscription.phone || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Amount</label>
                    <p className="text-gray-800 mt-1 font-medium">₹{(subscription.amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Period</label>
                    <p className="text-gray-800 mt-1 font-medium">{subscription.period || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Method</label>
                    <p className="flex items-center mt-1">
                      {subscription.method === "auto" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          <Repeat className="h-3 w-3 mr-1" /> Automatic
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                          <CreditCard className="h-3 w-3 mr-1" /> Manual
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Status</label>
                    <p className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(subscription.paymentStatus)}`}>
                        {subscription.paymentStatus === "paid" ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        {subscription.paymentStatus || "N/A"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Payment</label>
                    <p className="flex items-center gap-1 text-gray-800 mt-1 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      {subscription.lastPaymentAt ? formatDate(subscription.lastPaymentAt) : "N/A"}
                    </p>
                  </div>
                  {subscription.method === "auto" && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Razorpay Subscription ID</label>
                      <p className="text-gray-800 mt-1 font-medium">{subscription.razorpaySubscriptionId || "N/A"}</p>
                    </div>
                  )}
                  {subscription.planId && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Plan ID</label>
                      <p className="text-gray-800 mt-1 font-medium">{subscription.planId}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="md:col-span-4 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 p-6">
                  <h3 className="text-lg font-medium text-gray-800">Analytics Summary</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Paid</label>
                      <p className="text-2xl font-bold text-gray-800 mt-1">₹{(totalAmount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Average Payment</label>
                      <p className="text-xl font-semibold text-gray-800 mt-1">₹{(donations.length ? totalAmount / donations.length : 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Count</label>
                      <p className="text-xl font-semibold text-gray-800 mt-1">{donations.length}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Actions</h3>
                  {subscription.method === "manual" ? (
                    <button 
                      onClick={handleCancelManualPayment} 
                      className="w-full px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center font-medium"
                    >
                      <X className="h-4 w-4 mr-2" /> Cancel Subscription
                    </button>
                  ) : (
                    <button 
                      onClick={handleCancelAutoPayment} 
                      className="w-full px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center font-medium"
                    >
                      <X className="h-4 w-4 mr-2" /> Cancel Subscription
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'history':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 p-6">
              <h3 className="text-lg font-medium text-gray-800">Payment History</h3>
            </div>
            
            <div className="overflow-x-auto">
              {donations.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {["ID", "Amount", "Type", "Method", "Status", "Date", "Actions"].map((label) => (
                        <th key={label} className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentDonations.map((donation) => (
                      <tr key={donation._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{donation._id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">₹{(donation.amount || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{donation.type || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {donation.method === "auto" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              <Repeat className="h-3 w-3 mr-1" /> Automatic
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                              <CreditCard className="h-3 w-3 mr-1" /> Manual
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(donation.paymentStatus || donation.status)}`}>
                            {(donation.paymentStatus || donation.status) === "paid" ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 mr-1" />
                            )}
                            {donation.paymentStatus || donation.status || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                            {donation.createdAt ? formatDate(donation.createdAt) : "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex">
                          <button 
                            onClick={() => viewDonationDetails(donation)} 
                            className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded-md hover:bg-blue-50"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => fetchTrackingData(donation._id)} 
                            className="text-emerald-600 hover:text-emerald-900 transition-colors p-1 rounded-md hover:bg-emerald-50"
                            title="View Timeline"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-gray-500 font-medium">No Payment Records</h3>
                  <p className="text-gray-400 text-sm mt-1">This subscription doesn't have any payment records yet.</p>
                </div>
              )}
            </div>
            
            {donations.length > 0 && (
              <div className="flex justify-between items-center p-6 border-t border-gray-100">
                <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} 
                    disabled={currentPage === 1} 
                    className="p-2 rounded-md disabled:text-gray-300 hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
                          ${currentPage === pageNum 
                              ? "bg-emerald-500 text-white" 
                              : "text-gray-700 hover:bg-gray-100"}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button 
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} 
                    disabled={currentPage === totalPages} 
                    className="p-2 rounded-md disabled:text-gray-300 hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
        
      case 'analytics':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Total Paid</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-3">₹{(totalAmount || 0).toLocaleString()}</p>
                </div>
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <CreditCard className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">Total amount collected from this subscription</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Average Payment</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-3">₹{(donations.length ? totalAmount / donations.length : 0).toLocaleString()}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">Average amount per payment transaction</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Payment Count</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-3">{donations.length}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <ArrowUpRight className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">Total number of payment transactions</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Toast Container */}
      <ToastContainer />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin/subscriptions/list" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-800">Subscription Details</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(subscription.paymentStatus)}`}>
                {subscription.paymentStatus === "paid" ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <AlertTriangle className="h-3 w-3 mr-1" />
                )}
                {subscription.paymentStatus || "Unknown Status"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Subscription Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between md:items-center">
            <div className="flex items-start space-x-4">
              <div className="bg-emerald-100 p-3 rounded-full">
                <User className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{subscription.name || "Unnamed Subscription"}</h2>
                <div className="flex items-center mt-1 text-gray-600 space-x-4">
                  <span className="flex items-center text-sm">
                    <FileText className="h-4 w-4 mr-1 text-gray-400" />
                    ID: {subscription._id?.slice(-8) || "N/A"}
                  </span>
                  {subscription.phone && (
                    <span className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-1 text-gray-400" />
                      {subscription.phone}
                    </span>
                  )}
                  <span className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    {subscription.lastPaymentAt ? formatDate(subscription.lastPaymentAt).split(',')[0] : "No payment yet"}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-end">
              <div className="text-3xl font-bold text-gray-800">₹{(subscription.amount || 0).toLocaleString()}</div>
              <div className="text-sm text-gray-500">{subscription.period || "Regular"} payment</div>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-1 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'text-emerald-600 border-b-2 border-emerald-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-4 px-1 text-sm font-medium ${
                activeTab === 'history'
                  ? 'text-emerald-600 border-b-2 border-emerald-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Payment History
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-4 px-1 text-sm font-medium ${
                activeTab === 'analytics'
                  ? 'text-emerald-600 border-b-2 border-emerald-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        {renderTabContent()}
      </div>

      {/* Donation Details Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-800">Donation Details</h3>
              <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500">ID</label>
                    <p className="text-sm font-medium text-gray-800 mt-1">{selectedDonation._id}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Amount</label>
                    <p className="text-sm font-bold text-gray-800 mt-1">₹{(selectedDonation.amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Type</label>
                    <p className="text-sm font-medium text-gray-800 mt-1">{selectedDonation.type || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Method</label>
                    <p className="text-sm font-medium text-gray-800 mt-1">{selectedDonation.method || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Status</label>
                    <p className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedDonation.paymentStatus || selectedDonation.status)}`}>
                        {(selectedDonation.paymentStatus || selectedDonation.status) === "paid" ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        {selectedDonation.paymentStatus || selectedDonation.status || "N/A"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Date</label>
                    <p className="text-sm font-medium text-gray-800 mt-1">{selectedDonation.createdAt ? formatDate(selectedDonation.createdAt) : "N/A"}</p>
                  </div>
                </div>
              </div>
              
              {selectedDonation.metadata && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Metadata</label>
                  <div className="mt-1 bg-gray-50 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                    <pre>{JSON.stringify(selectedDonation.metadata, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={closeModal} 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {trackingData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-800">Payment Timeline</h3>
              <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {trackingData.length > 0 ? (
              <ul className="space-y-6">
                {trackingData.map((event, index) => (
                  <li key={index} className="relative pl-6">
                    <div className="absolute left-0 top-0 h-full">
                      <div className="flex flex-col items-center h-full">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        {index < trackingData.length - 1 && <div className="w-0.5 bg-emerald-200 flex-grow mt-1"></div>}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-800">{event.event || "Event"}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                          {event.status || "N/A"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{event.timestamp ? formatDate(event.timestamp) : "N/A"}</p>
                      {event.details && (
                        <div className="mt-2 bg-white p-2 rounded border border-gray-100 text-xs font-mono overflow-x-auto">
                          <pre>{JSON.stringify(event.details, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-gray-500 font-medium">No Timeline Data</h3>
                <p className="text-gray-400 text-sm mt-1">There is no tracking information available for this payment.</p>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button 
                onClick={closeModal} 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}