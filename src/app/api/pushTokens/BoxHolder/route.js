import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    console.log("Request received");

    const body = await req.json(); // Parse the request body
    console.log("Request Body:", body);

    if (!body || Object.keys(body).length === 0) {
      console.log("No data provided in request body");
      return NextResponse.json(
        { success: false, message: "Request body is required" },
        { status: 400 }
      );
    }

    // Access the raw MongoDB collection
    const db = mongoose.connection.db;
    const collection = db.collection("BoxHoldersTokens"); // Changed to BoxHoldersTokens

    // Insert or update the entire request body
    const result = await collection.updateOne(
      { expoPushToken: body.expoPushToken }, // Find by expoPushToken (if it exists)
      { $set: body }, // Set the entire request body
      { upsert: true } // Upsert: insert if not found, update if found
    );

    console.log("Data saved to database:", result);
    return NextResponse.json({
      success: true,
      message: "Data saved successfully",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId,
    });
  } catch (error) {
    console.error("Error saving data:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}