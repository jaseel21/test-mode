// src/app/api/subscriptions/check/route.js
import connectToDatabase from "../../../../lib/db"; // Adjust path
import Subscription from "../../../../models/Subscription"; // Adjust path
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectToDatabase();
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const existingSubscription = await Subscription.findOne({ phone });

    return NextResponse.json(
      { isSubscribed: !!existingSubscription },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json({ error: "Failed to check subscription" }, { status: 500 });
  }
}