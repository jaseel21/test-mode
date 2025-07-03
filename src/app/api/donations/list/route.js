import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Donation from "@/models/Donation";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");

  try {
    await dbConnect();
    let donations;
    if (phone) {
      donations = await Donation.find({ phone }).sort({ createdAt: -1 });
    } else {
      donations = await Donation.find().sort({ createdAt: -1 });
    }
    return NextResponse.json(donations, { status: 200 });
  } catch (error) {
    console.error("Error fetching donations:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}