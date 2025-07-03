// File: /app/api/donations/create-physical/route.js

import PhysicalDonation from "../../../../models/PhysicalDonation";
import connectToDatabase  from "../../../../lib/db"; // Adjust path to your MongoDB connection utility
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Ensure database connection
    await connectToDatabase();

    // Parse the request body
    const donationData = await req.json();
    console.log("Request body:", donationData);

    // Create new document
    const donation = new PhysicalDonation(donationData);
    const savedDonation = await donation.save();

    // Return success response
    return NextResponse.json(
      {
        success: true,
        id: savedDonation._id.toString(),
        message: "Physical donation recorded successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error inserting physical donation:", error);
    return NextResponse.json(
      {
        error: "Failed to record donation",
        details: error.message,
      },
      { status: 500 }
    );
  }
}