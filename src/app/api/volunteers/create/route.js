// app/api/volunteers/route.js
import { NextResponse } from "next/server";
// import mongoose from "mongoose";
import connectToDatabase from "@/lib/db"; // Adjust path to your database connection utility
import Volunteer from "@/models/Volunteer"; // Adjust path to your Volunteer model

export async function POST(req) {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Parse request body
    const data = await req.json();
    const { name, phone, email, place, status } = data;

    // Validate required fields
    if (!name || !phone || !place) {
      return NextResponse.json(
        { error: "Name, phone, and place are required" },
        { status: 400 }
      );
    }

    // Check if a volunteer with the same phone number already exists
    const existingVolunteer = await Volunteer.findOne({ phone });
    if (existingVolunteer) {
      return NextResponse.json(
        { error: "This number is already registered as a volunteer" },
        { status: 409 } // 409 Conflict status for duplicate resource
      );
    }

    // Check if email is provided and already exists (optional since email isn't required)
    if (email) {
      const existingEmail = await Volunteer.findOne({ email });
      if (existingEmail) {
        return NextResponse.json(
          { error: "This email is already registered" },
          { status: 409 }
        );
      }
    }

    // Create new volunteer
    const volunteer = new Volunteer({
      name,
      phone:"+91"+phone,
      email: email || undefined, // Set to undefined if empty to avoid empty string
      place,
      status: status || "pending", // Default to "pending" if not provided
      role: "Volunteer", // Default role from schema
    });

    // Save to database
    await volunteer.save();

    return NextResponse.json(
      { success: true, message: "Volunteer registered successfully", data: volunteer },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating volunteer:", error);

    // Handle MongoDB duplicate key error for email (if it occurs despite check)
    if (error.code === 11000 && error.keyPattern?.email) {
      return NextResponse.json(
        { error: "This email is already registered" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to register volunteer", details: error.message },
      { status: 500 }
    );
  }
}