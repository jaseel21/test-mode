"use client";
import { useSearchParams } from "next/navigation";

export default function BoxPaymentSuccessPage() {
  const searchParams = useSearchParams();

  const donationId = searchParams.get("donationId");
  const amount = searchParams.get("amount");
  const name = decodeURIComponent(searchParams.get("name") || "");
  const phone = searchParams.get("phone");
  const paymentId = searchParams.get("paymentId");
  const orderId = searchParams.get("orderId");

  const handleDownloadReceipt = async () => {
    try {
      const response = await fetch("/api/donations/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json", 
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
        },
        body: JSON.stringify({
          donationId,
          amount,
          name,
          phone,
          paymentId,
          orderId,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate receipt");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Box_Payment_Receipt_${donationId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading receipt:", error);
      alert("Failed to download receipt. Please try again.");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-3xl font-bold text-green-600 mb-6">Payment Successful!</h1>
      <p className="text-lg text-gray-700 mb-4">
        Thank you for your payment! Below are the details of your contribution.
      </p>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Payment Details</h2>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Phone:</strong> {phone}</p>
        <p><strong>Amount:</strong> ₹{amount}</p>
        <p><strong>Payment ID:</strong> {paymentId}</p>
        <p><strong>Order ID:</strong> {orderId}</p>
        <p><strong>Donation ID:</strong> {donationId}</p>
      </div>

      <button
        onClick={handleDownloadReceipt}
        className="mt-6 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Download Receipt
      </button>
      <a
        href="/boxes"
        className="mt-4 block text-center text-blue-600 hover:underline"
      >
        Back to Boxes
      </a>
    </div>
  );
}