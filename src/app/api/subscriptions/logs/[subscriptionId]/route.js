import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Define the Log Schema (if not already defined)
const LogSchema = new mongoose.Schema({
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Subscription" },
  action: { type: String, required: true },
  details: { type: Object },
  timestamp: { type: Date, default: Date.now },
});

const Log = mongoose.models.Log || mongoose.model("Log", LogSchema);

export async function GET(request, { params }) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const { subscriptionId } = params;

    if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
      return NextResponse.json({ error: "Invalid subscription ID" }, { status: 400 });
    }

    const logs = await Log.find({ subscriptionId })
      .sort({ timestamp: -1 }) // Latest logs first
      .lean();

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const { subscriptionId } = params;
    const { action, details } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
      return NextResponse.json({ error: "Invalid subscription ID" }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    const newLog = new Log({
      subscriptionId,
      action,
      details,
      timestamp: new Date(),
    });

    await newLog.save();

    return NextResponse.json({ message: "Log added successfully", log: newLog }, { status: 201 });
  } catch (error) {
    console.error("Error adding log:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}