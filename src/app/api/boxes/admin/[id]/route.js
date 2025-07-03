import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Box from "../../../../../models/Box"; // Adjust the path based on your project structure

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
}

// GET: Fetch a specific box by ID
export async function GET(req, { params }) {
  const { id } = params;

  try {
    await connectDB();
    const box = await Box.findById(id).lean();
    if (!box) {
      return NextResponse.json({ error: "Box not found" }, { status: 404 });
    }
    return NextResponse.json(box, { status: 200 });
  } catch (error) {
    console.error("Error fetching box:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update a specific box by ID
export async function PUT(req, { params }) {
  const { id } = params;

  try {
    await connectDB();
    const body = await req.json();
    const updatedBox = await Box.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!updatedBox) {
      return NextResponse.json({ error: "Box not found" }, { status: 404 });
    }
    return NextResponse.json(updatedBox, { status: 200 });
  } catch (error) {
    console.error("Error updating box:", error);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

// DELETE: Delete a specific box by ID
export async function DELETE(req, { params }) {
  const { id } = params;

  try {
    await connectDB();
    const deletedBox = await Box.findByIdAndDelete(id);
    if (!deletedBox) {
      return NextResponse.json({ error: "Box not found" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting box:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}