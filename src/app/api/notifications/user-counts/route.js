import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "../../../../lib/db";

// Validate API Key middleware
function validateApiKey(request) {
  const apiKey = request.headers.get('x-api-key');
  const validApiKey = '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d'; // In production, this should be stored in environment variables
  
  if (!apiKey || apiKey !== validApiKey) {
    return false;
  }
  
  return true;
}

// GET handler to fetch user counts by group
export async function GET(request) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid API key" },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectToDatabase();
    
    const db = mongoose.connection.db;
    
    // Count users by group
    const allUsersCount = await db.collection("PushTokens").countDocuments();
    const subscribersCount = await db.collection("SubscriberTokens").countDocuments();
    const boxholdersCount = await db.collection("BoxHoldersTokens").countDocuments();
    
    return NextResponse.json({
      success: true,
      counts: {
        all: allUsersCount,
        subscribers: subscribersCount,
        boxholders: boxholdersCount
      }
    });
  } catch (error) {
    console.error('Error fetching user counts:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}