// src/app/api/donations/create/route.js
import connectToDatabase from "../../../../lib/db";
import Donation from "../../../../models/Donation";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    await connectToDatabase();

    const body = await req.json();
    console.log("Request body:", body);

    const {
      amount,
      type,
      name,
      phone,
      district,
      panchayat,
      boxId,
      email,
      campaignId,
      instituteId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature, 
    } = body;

    // Validate required fields
    if (!amount || !type || !razorpayPaymentId) {
      return NextResponse.json(
        { error: "Missing required fields (amount, type, razorpayPaymentId)" },
        { status: 400 }
      );
    }

    // ✅ Fetch payment details from Razorpay API
    const payment = await razorpay.payments.fetch(razorpayPaymentId);

    console.log("Razorpay Payment Details:", payment);

    // Check if payment is valid and captured
    if (payment.status !== "captured") {
      return NextResponse.json(
        { error: "Payment not captured or failed", paymentStatus: payment.status },
        { status: 400 }
      );
    }

    // ✅ Check if amount matches
    const paidAmount = payment.amount / 100; // Razorpay stores amount in paise
    if (paidAmount !== parseFloat(amount)) {
      return NextResponse.json(
        { error: "Amount mismatch", expected: amount, received: paidAmount },
        { status: 400 }
      );
    }

    // ✅ Save donation to database
    const donation = new Donation({
      amount: parseFloat(amount),
      type,
      name: name || null,
      phone: phone?.startsWith("+") ? phone : phone ? "+91" + phone : null,
      email: email || null,
      district: district || null,
      panchayat: panchayat || null,
      boxId: boxId || null,
      campaignId: campaignId || null,
      instituteId: instituteId || null,
      razorpayPaymentId,
      razorpayOrderId ,
      razorpaySignature,
      status: "Completed",
    });

    await donation.save();

    return NextResponse.json(
      { message: "Donation created successfully", id: donation._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating donation:", error);
    return NextResponse.json(
      { error: "Failed to create donation", details: error.message },
      { status: 500 }
    );
  }
}