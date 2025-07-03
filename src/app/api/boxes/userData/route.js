import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import Box from "../../../../models/Box";

export async function GET(req) {
  try {
    // Extract search parameters correctly
    const { searchParams } = new URL(req.url);
    let phone = searchParams.get("phoneNumber");

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // phone = "+91" + phone;
    console.log(phone);
    

    await connectToDatabase();

    // Fetch boxes for the given phone number
    const boxes = await Box.find({ phone }).lean();

    if (!boxes || boxes.length === 0) {
      return NextResponse.json({ error: "No user data found for this phone number" }, { status: 404 });
    }

    // Extract user data from the first box (assuming consistent user info across boxes)
    const userData = {
      id: boxes[0]._id || "Unknown",
      name: boxes[0].name || "Unknown", // Fallback if name is missing
      phoneNumber: boxes[0].phone,
      email: boxes[0].email || "N/A", // Fallback if email is missing
      address: boxes[0].address || "N/A", // Fallback if address is missing
      

    };

    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}
