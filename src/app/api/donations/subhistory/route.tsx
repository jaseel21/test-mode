// src/app/api/donations/subhistory/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db"; // Adjust import path
import Sdonation from "@/models/Sdonation"; // Adjust import path

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const subscriptionId = searchParams.get("subscriptionId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "4");

  if (!subscriptionId) {
    return NextResponse.json({ error: "subscriptionId is required" }, { status: 400 });
  }

  try {
    const skip = (page - 1) * limit;
    const totalDonations = await Sdonation.countDocuments({ subscriptionId });
    const donations = await Sdonation.find({ subscriptionId })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: donations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalDonations / limit) || 1,
        totalItems: totalDonations,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching donation history:", error);
    return NextResponse.json(
      { error: "Failed to fetch donation history", details: error },
      { status: 500 }
    );
  }
}