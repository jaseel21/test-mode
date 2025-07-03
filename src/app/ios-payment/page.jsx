"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentPage() {
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount"); // Amount in rupees
  const name = searchParams.get("name");
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");
  const district = searchParams.get("district");
  const panchayat = searchParams.get("panchayat");
  const type = searchParams.get("type");
  const message = searchParams.get("message");
  const boxId = searchParams.get("boxId");
  const instituteId = searchParams.get("instituteId");
  const campaignId = searchParams.get("campaignId");
  const callbackUrl = searchParams.get("callbackUrl");

  const initiatePayment = () => {
    if (!orderId || !amount) {
      alert("Missing order ID or amount. Please try again.");
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: Number(amount) * 100, // Convert to paise on client side
      currency: "INR",
      name: "Amal AIC",
      description: `Payment for order ${orderId}`,
      order_id: orderId, // Use order_id for one-time payment
      handler: async function (response) {
        try {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

          // Prepare query parameters for callback
          const queryParams = new URLSearchParams({
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            name: name || "",
            amount,
            phone: phone || "",
            district: district || "",
            type: type || "General",
            email: email || "",
            panchayat: panchayat || "",
            message: message || "",
            boxId: boxId || "",
            instituteId: instituteId || "",
            campaignId: campaignId || "",
          }).toString();

          // Validate and construct callback URL
          const validCallbackUrl = callbackUrl && (callbackUrl.startsWith("http") || callbackUrl.startsWith("acme://"))
            ? callbackUrl
            : "acme://payment-success";
          const callbackUrlWithQuery = `${validCallbackUrl}?${queryParams}`;

          console.log("Redirecting to:", callbackUrlWithQuery);
          window.location.href = callbackUrlWithQuery;

          // Fallback for failed redirect
          setTimeout(() => {
            if (document.location.href !== callbackUrlWithQuery) {
              console.warn("Redirect failed, falling back to web success page");
              window.location.href = "https://yourwebsite.com/payment-success";
            }
          }, 2000);
        } catch (error) {
          console.error("Payment processing error:", error);
          alert("Payment processing failed. Please try again later.");
        }
      },
      prefill: {
        name: name || "",
        contact: phone || "",
        email: email || "default@example.com",
      },
      theme: { color: "#10B981" },
      modal: {
        confirm_close: true,
        escape: true,
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response) => {
      console.error("Payment failed details:", response.error);
      alert(`Payment failed: ${response.error.description || "An error occurred. Please try again."}`);
    });
    rzp.open();
  };

  useEffect(() => {
    const loadRazorpay = () => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => initiatePayment();
      script.onerror = () => {
        console.error("Failed to load Razorpay SDK");
        alert("Failed to load payment gateway. Please try again later.");
      };
      document.body.appendChild(script);
    };

    loadRazorpay();
  }, []);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100 overflow-hidden p-4">
      <div className="relative flex flex-col items-center gap-6 p-8 bg-white rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-blue-300 border-t-transparent rounded-full animate-[spin_2s_linear_infinite] opacity-50"></div>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold text-gray-800 animate-pulse">
            Processing Payment
          </p>
          <span className="flex gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></span>
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
          </span>
        </div>
        <p className="text-sm text-gray-500 animate-[fadeIn_1s_ease-in_forwards]">
          Please wait while we process your transaction
        </p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-200 via-transparent to-blue-200 opacity-20 animate-[gradient_6s_ease_infinite] bg-[length:200%_200%]"></div>
    </div>
  );
}