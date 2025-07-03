// src/app/api/campaigns/all/route.js - UPDATED
import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import Campaign from "../../../../models/Campaign";

export async function GET() {
  try {
    await connectToDatabase();
    const campaigns = await Campaign.find({}).lean(); // Fetch all campaigns
    
    console.log("Fetched campaigns:", campaigns); // Debug log
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}
