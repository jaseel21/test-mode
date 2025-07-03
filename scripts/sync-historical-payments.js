const mongoose = require("mongoose");
const axios = require("axios");
const connectDB = require("../src/lib/db");
const Donation = require("../src/models/Donation");

async function syncHistoricalPayments() {
  try {
    await connectDB();

    const razorpayKey = process.env.RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    // Fetch payments from the last 90 days
    const today = new Date();
    const fromDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get("https://api.razorpay.com/v1/payments", {
        auth: {
          username: razorpayKey,
          password: razorpaySecret,
        },
        params: {
          from: Math.floor(fromDate.getTime() / 1000),
          to: Math.floor(today.getTime() / 1000),
          count: 100,
          skip,
        },
      });

      const payments = response.data.items;
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
            console.log("Backfilled donation:", donation);
          }
        }
      }

      skip += 100;
      hasMore = payments.length === 100;
    }

    console.log("Backfill complete");
    process.exit(0);
  } catch (error) {
    console.error("Backfill error:", error);
    process.exit(1);
  }
}

syncHistoricalPayments();