import { NextResponse } from "next/server";
import dbConnect from "@/lib/db"; 
import Volunteer from "@/models/Volunteer"; 

export async function POST(req) {
  try {
    console.log("🔹 Received request at /api/auth/v/sign-up");

    await dbConnect();

    const { name, phone, email, place } = await req.json();
    console.log("🔹 Form Data:", { name, phone, email, place });

    if (!name || !phone || !email || !place) {
      console.error("❌ Missing required fields");
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if email already exists
    const existingVolunteer = await Volunteer.findOne({ email });
    if (existingVolunteer) {
      console.error("❌ Email already registered:", email);
      return NextResponse.json({ error: "Email already exists, please use another email" }, { status: 409 });
    }

    // Create and save volunteer
    const newVolunteer = new Volunteer({ name, phone, email, place });
    await newVolunteer.save();

    console.log("✅ Volunteer added successfully:", newVolunteer);
    return NextResponse.json({ message: "Volunteer added successfully" }, { status: 201 });

  } catch (error) {
    console.error("🔥 Server Error:", error);
    
    // Return detailed error message
    return NextResponse.json({ error: `Server Error: ${error.message}` }, { status: 500 });
  }
}
