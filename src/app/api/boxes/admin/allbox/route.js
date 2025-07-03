
import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/db"
import Box from "../../../../../models/Box"; // Adjust path based on your project structure

// Connect to MongoDB


export async function GET() {
  try {
    await connectDB();
    const boxes = await Box.find().sort({ createdAt: -1 }); // Sort by creation date, newest first
    return NextResponse.json(boxes, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching boxes:", error);
    return NextResponse.json({ error: "Failed to fetch boxes" }, { status: 500 });
  }
}