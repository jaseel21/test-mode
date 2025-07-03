import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Donation from "@/models/Donation";
import axios from "axios";

export async function POST() {
  try {
    await connectDB();

    // Razorpay API credentials
    const razorpayKey = process.env.RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    // Fetch payments from Razorpay (last 7 days as an example)
    const today = new Date();
    const fromDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const response = await axios.get("https://api.razorpay.com/v1/payments", {
      auth: {
        username: razorpayKey,
        password: razorpaySecret,
      },
      params: {
        from: Math.floor(fromDate.getTime() / 1000),
        to: Math.floor(today.getTime() / 1000),
        count: 100, // Adjust based on volume
      },
    });

    const payments = response.data.items;

    // Process each payment
    for (const payment of payments) {
      if (payment.status === "captured") {
        const existingDonation = await Donation.findOne({ razorpayPaymentId: payment.id });
        if (!existingDonation) {
          const donation = new Donation({
            amount: payment.amount / 100,
            type: payment.notes?.type || "General",
            razorpayPaymentId: payment.id,
            razorpayOrderId: payment.order_id || null,
            status: "Completed",
            method: payment.method,
            name: payment.notes?.name || "Anonymous",
            phone: payment.contact || null,
            email: payment.email || null,
            createdAt: new Date(payment.created_at * 1000),
          });
          await donation.save();
          console.log("Synced donation:", donation);
        }
      }
    }

    return NextResponse.json({ success: true, synced: payments.length });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Failed to sync payments" }, { status: 500 });
  }
}