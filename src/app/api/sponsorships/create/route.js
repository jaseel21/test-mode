// src/app/api/sponsor/create/route.js (assumed path)
import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/db";
import Sponsor from "../../../../models/Sponsor";
import Razorpay from "razorpay";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
  

    const {
      amount,
      name,
      phone,
      type,
      email,
      period,
      district,
      panchayat,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = body;

    // Validate required fields
    if (!amount || !type || !razorpayPaymentId) {
      console.log("Missing required fields:", { amount, type, razorpayPaymentId });
      return NextResponse.json(
        { error: "Missing required fields: amount, type, razorpayPaymentId are required" },
        { status: 400 }
      );
    }

    // Validate amount is a number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      console.log("Invalid amount:", amount);
      return NextResponse.json({ error: "Amount must be a number" }, { status: 400 });
    }

    // Fetch payment details from Razorpay API
    const payment = await razorpay.payments.fetch(razorpayPaymentId);
    console.log("Razorpay Payment Details:", payment);

    // Check if payment is captured
    if (payment.status !== "captured") {
      console.log("Payment not captured:", payment.status);
      return NextResponse.json(
        { error: "Payment not captured or failed", paymentStatus: payment.status },
        { status: 400 }
      );
    }

    // Verify amount matches (Razorpay returns amount in paise)
    const paidAmount = payment.amount / 100; // Convert paise to INR
    if (paidAmount !== parsedAmount) {
      console.log("Amount mismatch:", { expected: parsedAmount, received: paidAmount });
      return NextResponse.json(
        { error: "Amount mismatch", expected: parsedAmount, received: paidAmount },
        { status: 400 }
      );
    }

    // Create sponsor record
    const donation = new Sponsor({
      amount: parsedAmount,
      name,
      phone: phone?.startsWith("+") ? phone : "+91" + phone, // Keep your original phone formatting
      type,
      period,
      email,
      district,
      panchayat,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      status: "Completed"
    });

    await donation.save();
    console.log("🎉 Sponsor saved:", donation._id);

    return NextResponse.json({ id: donation._id }, { status: 201 });
  } catch (error) {
    console.error("Error saving donation:", error);
    return NextResponse.json(
      { error: "Failed to save donation", details: error.message },
      { status: 500 }
    );
  }
}