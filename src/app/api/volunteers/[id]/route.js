// src/app/api/volunteers/[id]/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Volunteer from "@/models/Volunteer";

// Helper function to format phone number with country code
const formatPhoneNumber = (phone) => {
  // Remove any non-digit characters except the leading "+"
  const cleaned = phone.replace(/(?!^\+)\D/g, "");

  // If it already starts with a country code (e.g., +91), return as is
  if (/^\+/.test(cleaned)) {
    return cleaned;
  }

  // If no country code, assume +91 (India) and prepend it
  if (/^\d{10}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }

  // If the number doesn't match expected formats, return it unchanged (or throw an error)
  return cleaned;
};

// PATCH: Update a volunteer's details
export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    const data = await request.json();

    // Define allowed fields to update
    const allowedUpdates = ["name", "phone", "email", "place", "status", "role"];
    const updates = Object.keys(data).reduce((acc, key) => {
      if (allowedUpdates.includes(key)) {
        acc[key] = data[key];
      }
      return acc;
    }, {});

    // Format phone number with country code if provided
    if (updates.phone) {
      updates.phone = formatPhoneNumber(updates.phone);

      // Optional: Check for duplicate phone numbers
      const existingVolunteer = await Volunteer.findOne({
        phone: updates.phone,
        _id: { $ne: params.id }, // Exclude the current volunteer
      });
      if (existingVolunteer) {
        return NextResponse.json(
          { error: "This phone number is already registered by another volunteer" },
          { status: 409 }
        );
      }
    }

    // Add updatedAt timestamp
    updates.updatedAt = new Date();

    // Validate status if provided
    if (updates.status && !["pending", "approved", "rejected"].includes(updates.status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const volunteer = await Volunteer.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true, runValidators: true } // Return updated doc and run schema validators
    );

    if (!volunteer) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
    }

    return NextResponse.json(volunteer);
  } catch (error) {
    console.error("Error updating volunteer:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET and DELETE remain unchanged
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const volunteer = await Volunteer.findById(params.id);

    if (!volunteer) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
    }

    return NextResponse.json(volunteer);
  } catch (error) {
    console.error("Error fetching volunteer:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const volunteer = await Volunteer.findByIdAndDelete(params.id);

    if (!volunteer) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Volunteer deleted successfully" });
  } catch (error) {
    console.error("Error deleting volunteer:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}