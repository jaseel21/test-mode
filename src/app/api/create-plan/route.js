import Razorpay from "razorpay";
import connectDB from "../../../lib/db";
import { NextResponse } from "next/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    // Verify environment variables
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Missing Razorpay credentials");
      return NextResponse.json({ error: "Server configuration error: Missing Razorpay credentials" }, { status: 500 });
    }

    await connectDB();
    const { name, phoneNumber, amount, period, interval } = await req.json();

    if (!name || !phoneNumber || !amount || !period || !interval) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate period
    const validPeriods = ["daily", "weekly", "monthly", "yearly"];
    if (!validPeriods.includes(period)) {
      return NextResponse.json({ error: "Invalid period value" }, { status: 400 });
    }

    // Validate interval
    if (!Number.isInteger(interval) || interval < 1) {
      return NextResponse.json({ error: "Invalid interval value" }, { status: 400 });
    }

    console.log("Creating plan with:", { name, phoneNumber, amount, period, interval });

    // Create Razorpay plan
    const plan = await razorpay.plans.create({
      period,
      interval,
      item: { name: `${period} Donation Subscription`, amount: amount * 100, currency: "INR" },
    });

    console.log("Razorpay plan created:", plan);

    // Uncomment and implement Donor/Subscription logic as needed
    /*
    let phone = "+91" + phoneNumber;
    let donor = await Donor.findOne({ phone });
    if (!donor) {
      console.log("Creating new donor...");
      donor = await Donor.create({ name, phone, period });
    } else {
      console.log("Donor already exists:", donor);
      return NextResponse.json({ exist: true });
    }

    const subscription = new Subscription({
      donorId: donor._id,
      planId: plan.id,
      name: donor.name,
      amount,
      period,
      phone: "+91" + phoneNumber,
      interval,
      status: "active",
      method: "auto",
    });
    await subscription.save();
    console.log("Subscription saved to DB:", subscription);
    */

    return NextResponse.json({ planId: plan.id });
  } catch (error) {
    console.error("Plan creation error:", {
      message: error.message,
      code: error.code,
      details: error.description || error.stack,
    });
    return NextResponse.json(
      { error: "Plan creation failed", details: error.message || error.description },
      { status: 500 }
    );
  }
}