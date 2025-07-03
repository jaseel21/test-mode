import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Subscription from "@/models/Subscription";
import Donation from "@/models/FetchDonation";
import Donor from "@/models/Donor"
import { paymentStatusMiddleware } from "@/middleware/paymentStatus";

async function handler(request) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const { searchParams } = new URL(request.url);
    const donorId = searchParams.get("donorId");
    const subscriptionId = searchParams.get("subscriptionId");

    const subscription = await Subscription.findById(subscriptionId).lean();
    if (!subscription) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

    const donor = await Donor.findById(donorId).lean();
    if (!donor) return NextResponse.json({ error: "Donor not found" }, { status: 404 });

    const subscriptionObjectId = new mongoose.Types.ObjectId(subscriptionId);
    
    const donations = await Donation.find({ subscriptionId:subscriptionObjectId }).sort({ createdAt: -1 }).lean();
    const totalAmount = donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);

    return NextResponse.json({
      subscription, // Raw subscription data
      donor,
      donations,
      totalAmount,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export const GET = paymentStatusMiddleware(handler);

