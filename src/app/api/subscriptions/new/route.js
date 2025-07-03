// src/app/api/subscriptions/new/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import Donor from "../../../../models/Donor";
import Subscription from "../../../../models/Subscription";
import Sdonation from "../../../../models/Sdonation";
import twilio from "twilio";

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const {
      name,
      phone: rawPhone, // Rename to avoid reassignment conflict
      amount,
      period,
      email,
      type,
      district,
      panchayat,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = body;

    console.log("Received Data:", { name, phone: rawPhone, amount, period });

    // Validate required fields
    if (!name || !rawPhone || !amount || !period) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Normalize and add country code
    const phone = normalizePhoneNumber(rawPhone); // Use a function to handle this
    console.log("Normalized Phone with Country Code:", phone);

    // Find or create donor
    let donor = await Donor.findOne({ phone });
    if (!donor) {
      console.log("Creating new donor...");
      donor = await Donor.create({ name, phone,email, period });
    } else {
      console.log("Donor already exists:", donor);
      return NextResponse.json({ exist: true });
    }

    // Create subscription
    console.log("Creating new subscription...");
    const subscription = await Subscription.create({
      donorId: donor._id,
      name,
      phone,
      amount,
      period,
      email,
      district,
      panchayat,
      method:"manual",
      status:"active"
    });
    console.log("Subscription Created:", subscription);

    // Create first donation with paymentStatus
    console.log("Creating new donation...");
    const newDonation = await Sdonation.create({
      donorId: donor._id,
      subscriptionId: subscription._id,
      phone,
      name,
      amount,
      email,
      type: type || "General", // Use provided type or default
      period,
      district,
      panchayat,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    });
    console.log("Donation Created:", newDonation);

      const toNumber = `whatsapp:${phone}`
    try {
      await twilioClient.messages.create({
        body: `Thank you! Your ${subscription.period} donation subscription is now active. Amount: ₹${subscription.amount}. the Subscription enabled.`,
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: toNumber,
      });
    } catch (twilioError) {
      console.error("Twilio error:", twilioError.message);
    }

    return NextResponse.json({ success: true, donor, subscription, donation: newDonation });
  } catch (error) {
    console.error("Error:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Duplicate entry detected", details: "A donor with this phone number already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to normalize phone number and add country code
function normalizePhoneNumber(rawPhone) {
  // Remove any non-digit characters (spaces, dashes, etc.)
  const digitsOnly = rawPhone.replace(/\D/g, "");

  // Check if it already has a country code
  if (digitsOnly.startsWith("91") && digitsOnly.length === 12) {
    return `+${digitsOnly}`; // Already has +91, just add the +
  } else if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`; // Add +91 to a 10-digit number
  } else {
    throw new Error("Invalid phone number format. Please provide a 10-digit number.");
  }
}