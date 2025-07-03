import connectToDatabase from "../../../../lib/db";
// import FAdonation from "../../../../models/FAdonation";
import { NextResponse } from "next/server";


export async function POST(req) {
  try {
    await connectToDatabase();

    const body = await req.json();
    console.log("Request body:", body);

    const {
      amount,
      type,
      userId = "guest", // Default to "guest" if not provided
      name,
      phone,
      district,
      panchayat,
      campaignId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = body;

    // Validate required fields
    if (!amount || !type || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

  
    if (generatedSignature !== razorpaySignature) {
      console.log("Signature mismatch:", { generatedSignature, razorpaySignature });
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // Create donation record
    const donation = new Donation({
      amount: parseFloat(amount), // Ensure amount is a number
      type,
      userId,
      boxId: boxId || null,
      name: name || null,
      phone: phone || null,
      district: district || null,
      panchayat: panchayat || null,
      campaignId: campaignId || null,
      razorpayPaymentId,
      razorpayOrderId,
      status: "Completed",
    });
    console.log(donation);
    

    await donation.save();
    console.log("Donation saved:", donation._id);

    return NextResponse.json(
      { message: "Donation created", id: donation._id },
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