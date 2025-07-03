"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentPage() {
  // const router = useRouter();
  const searchParams = useSearchParams();

  const subscriptionId = searchParams.get("subscriptionId");
  const planId = searchParams.get("planId");
  const period = searchParams.get("period");
  const callbackUrl = searchParams.get("callbackUrl");
  const amount = searchParams.get("amount");
  const name = searchParams.get("name");
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");
  const district = searchParams.get("district");
  const panchayat = searchParams.get("panchayat");
  const donationId = searchParams.get("donationId");

  useEffect(() => {
    // Load Razorpay SDK
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

    const initiatePayment = () => {
      if (!subscriptionId || !amount || !callbackUrl) {
        console.error("Missing required parameters:", { subscriptionId, amount, callbackUrl });
        alert("Missing payment details. Please try again.");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Number(amount) * 100,
        currency: "INR",
        name: "Amal AIC",
        description: `Initial payment for subscription ${subscriptionId}`,
        subscription_id: subscriptionId,
        handler: async function (response) {
          try {
            const razorpayPaymentId = response.razorpay_payment_id;
            const razorpaySubscriptionId = subscriptionId;

            // const apiResponse = await axios.post(
            //   "/api/update-subscription-status",
            //   {
            //     razorpaySubscriptionId,
            //     name,
            //     amount,
            //     phoneNumber: phone,
            //     district,
            //     type: "General",
            //     method: "auto",
            //     planId,
            //     email,
            //     panchayat,
            //     period,
            //     razorpay_payment_id: razorpayPaymentId,
            //     status: "active",
            //   },
            //   {
            //     headers: {
            //       "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
            //     },
            //   }
            // );

            // const { data } = apiResponse;

            const queryParams = new URLSearchParams({
              razorpaySubscriptionId,
              name,
              amount,
              phone,
              district: encodeURIComponent(district || ""),
              type: "General",
              method: "auto",
              planId,
              email: email || "",
              panchayat: encodeURIComponent(panchayat || ""),
              period,
              razorpayPaymentId: razorpayPaymentId || "",
              status: "active",
              subscriptionId:"subscriptionId" || "",
              donationId: "donationId" || "",
            }).toString();

            const validCallbackUrl = callbackUrl.startsWith("http") || callbackUrl.startsWith("acme://")
              ? callbackUrl
              : "acme://payment-success";
            const callbackUrlWithQuery = `${validCallbackUrl}?${queryParams}`;

            console.log("Redirecting to:", callbackUrlWithQuery);
            window.location.href = callbackUrlWithQuery;

            // Fallback if redirect fails
            // setTimeout(() => {
            //   alert("Redirect failed. Please check your app or contact support.");
            //   axios.post("/api/payment-fallback", { subscriptionId, status: "pending" });
            // }, 2000);
          } catch (error) {
            console.error("Payment error:", error.response?.status, error.response?.data);
            alert(`Payment failed: ${error.response?.data?.error || "Please try again later."}`);
          }
        },
        prefill: {
          name,
          contact: phone,
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
        console.error("Payment failed:", response.error.description);
        alert(`Payment failed: ${response.error.description}. Please try again.`);
      });
      rzp.open();
    };

    loadRazorpay();
  }, [subscriptionId, amount, name, phone, district, panchayat, donationId, callbackUrl,email,period,planId]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100 overflow-hidden p-4">
      <div className="relative flex flex-col items-center gap-6 p-8 bg-white rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105">
        {/* Animated Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-blue-300 border-t-transparent rounded-full animate-[spin_2s_linear_infinite] opacity-50"></div>
        </div>

        {/* Processing Text with subtle animation */}
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold text-gray-800 animate-pulse">
            Processing Payment
          </p>
          <span className="flex gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
          </span>
        </div>

        {/* Subtle instruction */}
        <p className="text-sm text-gray-500 animate-[fadeIn_1s_ease-in_forwards]">
          Please wait while we process your transaction
        </p>
      </div>

      {/* Background gradient animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-200 via-transparent to-blue-200 opacity-20 animate-[gradient_6s_ease_infinite] bg-[length:200%_200%]"></div>
    </div>
  );
}