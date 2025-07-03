// src/app/payment/normal/page.js
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function NormalPaymentPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);

  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const name = searchParams.get("name");
  const phone = searchParams.get("phone");
  const email = searchParams.get("email");
  const district = searchParams.get("district");
  const panchayat = searchParams.get("panchayat");
  const callbackUrl = searchParams.get("callbackUrl");
  const type = searchParams.get("type");
  const message = searchParams.get("message");
  const boxId = searchParams.get("boxId");
  const instituteId = searchParams.get("instituteId");
  const campaignId = searchParams.get("campaignId");

  useEffect(() => {
    // Validate Razorpay key
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      console.error("Razorpay key is missing");
      setError("Payment configuration error. Please contact support.");
      return;
    }

    // Load Razorpay SDK
    const loadRazorpay = () => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => initiatePayment();
      script.onerror = () => {
        console.error("Failed to load Razorpay SDK");
        setError("Failed to load payment gateway. Please try again later.");
        alert("Failed to load payment gateway. Please try again later.");
      };
      document.body.appendChild(script);
    };

    const initiatePayment = () => {
      // Validate required parameters
      if (!orderId || !amount || !callbackUrl) {
        console.error("Missing required parameters:", { orderId, amount, callbackUrl });
        setError("Missing payment details. Please try again.");
        alert("Missing payment details. Please try again.");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Number(amount) * 100, // Convert rupees to paise
        currency: "INR",
        name: "Amal AIC",
        description: `Donation by ${name || "Anonymous"}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            const razorpayPaymentId = response.razorpay_payment_id;
            const razorpayOrderId = response.razorpay_order_id;

            // Construct query parameters for success page
            const queryParams = new URLSearchParams({
              razorpayPaymentId,
              razorpayOrderId,
              name: name || "",
              amount,
              phone: phone || "",
              district: encodeURIComponent(district || ""),
              panchayat: encodeURIComponent(panchayat || ""),
              type: type || "General",
              email: email || "",
              message: encodeURIComponent(message || ""),
              boxId: boxId || "",
              instituteId: instituteId || "",
              campaignId: campaignId || "",
            }).toString();

            // Validate and construct callback URL
            const validCallbackUrl = callbackUrl.startsWith("http") || callbackUrl.startsWith("acme://")
              ? callbackUrl
              : "acme://payment-success";
            const callbackUrlWithQuery = `${validCallbackUrl}?${queryParams}`;

            console.log("Redirecting to:", callbackUrlWithQuery);
            window.location.href = callbackUrlWithQuery;

            // Fallback if redirect fails (commented out as in PaymentPage)
            // setTimeout(() => {
            //   alert("Redirect failed. Please check your app or contact support.");
            //   axios.post("/api/payment-fallback", { orderId, status: "pending" });
            // }, 2000);
          } catch (error) {
            console.error("Payment error:", error.response?.status, error.response?.data);
            setError(`Payment failed: ${error.response?.data?.error || "Please try again later."}`);
            alert(`Payment failed: ${error.response?.data?.error || "Please try again later."}`);
          }
        },
        prefill: {
          name: name || "",
          contact: phone || "",
          email: email || "default@example.com",
        },
        notes: {
          district: district || "",
          panchayat: panchayat || "",
          type: type || "General",
          message: message || "",
          boxId: boxId || "",
          instituteId: instituteId || "",
          campaignId: campaignId || "",
        },
        theme: { color: "#10B981" },
        modal: {
          confirm_close: true,
          escape: true,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        console.error("Payment failed:", response.error.description);
        setError(`Payment failed: ${response.error.description}. Please try again.`);
        alert(`Payment failed: ${response.error.description}. Please try again.`);
      });
      rzp.open();
    };

    loadRazorpay();
  }, [orderId, amount, name, phone, email, district, panchayat, type, message, boxId, instituteId, campaignId, callbackUrl]);

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="p-8 bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-red-600">Payment Error</h1>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100 overflow-hidden p-4">
      <div className="relative flex flex-col items-center gap-6 p-8 bg-white rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-blue-300 border-t-transparent rounded-full animate-[spin_2s_linear_infinite] opacity-50"></div>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold text-gray-800 animate-pulse">
            Processing Donation Payment
          </p>
          <span className="flex gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></span>
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
          </span>
        </div>
        <p className="text-sm text-gray-500 animate-[fadeIn_1s_ease-in_forwards]">
          Please wait while we process your donation
        </p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-200 via-transparent to-blue-200 opacity-20 animate-[gradient_6s_ease_infinite] bg-[length:200%_200%]"></div>
    </div>
  );
}