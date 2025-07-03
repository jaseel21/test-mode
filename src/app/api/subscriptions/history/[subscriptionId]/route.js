import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Donation from "@/models/Donation";

export async function GET(request, { params }) {
  const { subscriptionId } = params;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const donations = await Donation.find({ subscriptionId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(donations);
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}