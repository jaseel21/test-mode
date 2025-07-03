"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function PayBoxClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [error, setError] = useState(null);
  const [boxData, setBoxData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const fetchBox = async () => {
      try {
        const response = await fetch(`/api/boxes/${id}`,{
          headers: {
            'x-api-key':process.env.NEXT_PUBLIC_API_KEY,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch box details");
        const data = await response.json();
        setBoxData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBox();
  }, [id]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    console.log(boxData);
    

    setProcessing(true);
    setError(null);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Failed to load payment gateway. Please check your internet connection.");

      // Create Razorpay order
      const response = await fetch("/api/donations/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" ,
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
        },
        body: JSON.stringify({ amount: parseInt(amount) * 100 }), // Convert to paise
      });

      const orderData = await response.json();
      if (!response.ok) throw new Error(orderData.error || "Order creation failed");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: parseInt(amount) * 100, // In paise
        currency: "INR",
        name: "Donation Box Payment",
        description: `Payment for Box ${boxData.serialNumber}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          const paymentData = {
            amount: amount,
            name: boxData.name,
            phone: boxData.phone,
            boxId: boxData._id,
            type: "Box",
            district: boxData.district,
            panchayat: boxData.panchayath,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };

          const saveResponse = await fetch("/api/donations/create", {
            method: "POST",
            headers: { "Content-Type": "application/json",
              'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
             },
            body: JSON.stringify(paymentData),
          });

          const saveData = await saveResponse.json()
          if (!saveResponse.ok) throw new Error(saveData.error || "Failed to save payment");

          // Update box payment status
          const boxUpdateResponse = await fetch(`/api/boxes/${id}/pay`, {
            method: "POST",
            headers: { "Content-Type": "application/json",
              'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
             },
            body: JSON.stringify({ amount: parseFloat(amount) }),
          });
          
          if (!boxUpdateResponse.ok) throw new Error("Box payment status update failed");
          
          // Redirect to success page
          router.push(
            `/box/pay/success?donationId=${saveData.id}&amount=${amount}&name=${encodeURIComponent(boxData.name)}&phone=${encodeURIComponent(boxData.phone)}&paymentId=${response.razorpay_payment_id}&orderId=${response.razorpay_order_id}`
          );
        },
        prefill: { 
          name: boxData.name, 
          contact: boxData.mobileNumber 
        },
        theme: { color: "#10B981" }, // Emerald green
        modal: {
          ondismiss: function() {
            setProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading payment details...</p>
      </div>
    );
  }

  if (error && !boxData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <svg className="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-gray-800">Error Loading Box</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button 
            onClick={() => router.push("/volunteer/collect-box")}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Boxes
          </button>
        </div>
      </div>
    );
  }

  if (!boxData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <svg className="mx-auto h-16 w-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7m16 0l-8 4m-8-4l8 4" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-gray-800">Box Not Found</h2>
          <p className="mt-2 text-gray-600">The requested donation box could not be found.</p>
          <button 
            onClick={() => router.push("/volunteer/collect-box")}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Boxes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <div className="mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 py-6 px-8">
            <h1 className="text-2xl font-bold text-white">
              Payment for Box #{boxData.serialNumber}
            </h1>
            <p className="mt-1 text-green-50">Complete your donation box payment</p>
          </div>
          
          {/* Content */}
          <div className="p-8">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex">
                  <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Box Details */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7m16 0l-8 4m-8-4l8 4" />
                  </svg>
                  Box Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-800">{boxData.name}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Serial Number</p>
                    <p className="font-medium text-gray-800">{boxData.serialNumber}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Status</p>
                    {
                      boxData.paymentStatus!=="dead" ?
                    <p className={`font-medium ${boxData.paymentStatus === "Paid" ? "text-green-600" : "text-red-600"}`}>
                      {boxData.paymentStatus} ({boxData.currentPeriod})
                    </p>
                    :
                    <p className={`font-medium ${boxData.paymentStatus === "Paid" ? "text-green-600" : "text-red-600"}`}>Dead</p>
                    }
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Last Payment</p>
                    <p className="font-medium text-gray-800">
                      {boxData.lastPayment ? new Date(boxData.lastPayment).toLocaleDateString() : "No previous payments"}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Payment Information */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Payment Information
                </h2>
                
                {/* Amount input */}
                <div className="relative">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Enter Amount (₹)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="block w-full pl-8 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      min="1"
                      step="0.01"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">INR</span>
                    </div>
                  </div>
                  {boxData.paymentStatus === "Pending" && (
                    <p className="mt-2 text-sm text-yellow-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Please pay before the period ends to avoid reminders!
                    </p>
                  )}
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={processing || !amount}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white ${
                    processing || !amount
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  }`}
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Make Payment
                    </>
                  )}
                </button>
                
                <p className="mt-3 text-xs text-center text-gray-500">
                  Secure payment powered by RazorPay. Your information is encrypted and secure.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}