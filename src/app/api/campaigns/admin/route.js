// src/app/api/campaigns/admin/route.js - UPDATED
import Campaign from "../../../../models/Campaign";
import connectToDatabase from "../../../../lib/db";

export async function GET(req) {
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  try {
    const campaigns = await Campaign.find(status ? { status } : {}).lean();
    
    return new Response(JSON.stringify(campaigns), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch campaigns" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}