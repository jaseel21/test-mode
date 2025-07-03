import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";  // Ensure correct path
import Donor from "../../../../models/Donor";
import Subscription from "../../../../models/Subscription";

export async function GET(request) {
  try {
    console.log("✅ API Call Reached: /api/subscriptions/search");

    await connectToDatabase();

    const url = new URL(request.url);
    let phone = url.searchParams.get("phone");

    console.log("Extracted Phone:", phone);

    if (!phone) {
      console.log("❌ No phone number provided");
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // ✅ Ensure phone format is consistent
    phone = phone.trim();


    
    // ✅ Search for donor by multiple possible formats
    const donor = await Donor.findOne({
      $or: [
        { phone: phone },               // Exact match
        { phone: phone.replace("+91", "") },  // Without +91
        { phone: "+91" + phone },        // Add +91 if missing
      ]
    });

    if (!donor) {
      console.log("❌ Donor not found for phone:", phone);
      return NextResponse.json({ error: "Donor not found" }, { status: 404 });
    }

    console.log("✅ Donor found:", donor);

    const subscription = await Subscription.findOne({ donorId: donor._id });

    if (!subscription) {
      console.log("❌ No subscription found for donor ID:", donor._id);
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    console.log("✅ Subscription found:", subscription);

    return NextResponse.json({
      donorId: donor._id,
      subscriptionId: subscription._id,
    });

  } catch (error) {
    console.error("❌ Error in API:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
