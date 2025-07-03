import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db"; // Your MongoDB connection utility
import Volunteer from "@/models/Volunteer"; // Import the Volunteer model

export async function GET(request) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    console.log(phone);
    

    // Check if phone is provided
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Connect to the database
    await connectToDatabase();

    // Query the Volunteer collection by phone
    const volunteer = await Volunteer.findOne({ phone }).lean();

    // Check if volunteer exists
    if (!volunteer) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
    }

    console.log(volunteer);
    
    // Return the volunteer data
    return NextResponse.json(volunteer, { status: 200 });
  } catch (error) {
    console.error("Error fetching volunteer:", error);
    return NextResponse.json({ error: "Failed to fetch volunteer data" }, { status: 500 });
  }
}