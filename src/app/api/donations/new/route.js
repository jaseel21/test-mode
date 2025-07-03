// src/app/api/donations/new/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import Sdonation from "../../../../models/Sdonation"; // Ensure this matches your model file
import Subscription from "../../../../models/Subscription";
import twilio from "twilio";

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(request) {
  console.log("Requested");
  try {
    await connectToDatabase();
    const { donorId, name, phone,district,panchayat, subscriptionId,status, amount, period,razorpayPaymentId,razorpayOrderId,method } = await request.json();

    console.log("Data Received:", { name, phone,subscriptionId,period });

    // Create new donation
    const donation = await Sdonation.create({
      donorId,
      subscriptionId,
      amount,
      period,
      name,
      phone,
      district,
      panchayat,
      type: "General", // Match schema case
      paymentStatus: "paid",
      razorpayPaymentId,
      razorpayOrderId,
      status,
      method,
      paymentDate: new Date(),
    });

    console.log("Donation Created:", donation);

    // Update subscription's createdAt to current time

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      { 
        createdAt: new Date(),
        lastPaymentAt: new Date()
      },
      { new: true }
    );

    console.log("Subscription Updated:", updatedSubscription);

    const toNumber = `whatsapp:${phone}`
    try {
      await twilioClient.messages.create({
        body: "Thank you for your continued generosity! Your donation of ₹${amount} has been received. Your support makes a meaningful difference, and we're grateful for your ongoing commitment.",
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: toNumber,
      });
    } catch (twilioError) {
      console.error("Twilio error:", twilioError.message);
    }

    return NextResponse.json({
      success: true,
      donation,
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}