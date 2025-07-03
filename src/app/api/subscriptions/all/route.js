import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Subscription from "@/models/Subscription";
import { paymentStatusMiddleware, getPaymentStatus } from "../../../../middleware/getPaymentStatus";

async function handler() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const subscriptions = await Subscription.find().lean();

    // Enrich each subscription with paymentStatus directly in the handler
    const enrichedSubscriptions = subscriptions.map((sub) => ({
      ...sub,
      paymentStatus: getPaymentStatus(sub.period, sub.lastPaymentAt),
    }));

    return NextResponse.json({
      subscriptions: enrichedSubscriptions,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const GET = paymentStatusMiddleware(handler);