import Razorpay from "razorpay";
import connectDB from "../../../lib/db";
import Subscription from "../../../models/AutoSubscription";
import { NextResponse } from "next/server";
import Donor from "../../../models/Donor";
import twilio from "twilio";
import mongoose from "mongoose"; // Required for ObjectId conversion

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(req) {
  try {
    await connectDB();
    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Missing subscriptionId" },
        { status: 400 }
      );
    }

    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionId,
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    await razorpay.subscriptions.cancel(subscriptionId);

    const donorObjectId = new mongoose.Types.ObjectId(subscription.donorId);
    const subscriptionObjectId = new mongoose.Types.ObjectId(subscription._id);

    await Donor.deleteOne({ _id: donorObjectId });
    await Subscription.deleteOne({ _id: subscriptionObjectId });

    const fromNumber = `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`;
    const to = `whatsapp:${subscription.phone}`; // Fixed syntax

    try {
      await twilioClient.messages.create({
        body: `Your ${subscription.period} donation subscription has been cancelled. Thank you for your support!`,
        from: fromNumber,
        to: to,
      });
    } catch (twilioError) {
      console.error("Twilio error:", twilioError.message);
    }

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled",
      subscriptionId: subscriptionId,
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
