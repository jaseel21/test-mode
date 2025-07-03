import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Donation from "@/models/Donation";

export async function GET() {
  try {
    await dbConnect();

    // Aggregate donations by type for Yatheem, Hafiz, Building, General
    const donationTypes = await Donation.aggregate([
      {
        $match: {
          status: "Completed",
          type: { $in: ["Yatheem", "Hafiz", "Building", "General"] },
        },
      },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Format the data for the pie chart
    const labels = ["Yatheem", "Hafiz", "Building", "General"];
    const data = labels.map((label) => {
      const donation = donationTypes.find((d) => d._id === label);
      return donation ? donation.totalAmount : 0;
    });

    return NextResponse.json({
      labels,
      data,
    });
  } catch (error) {
    console.error("Error fetching donation types:", error);
    return NextResponse.json(
      { error: "Failed to fetch donation types" },
      { status: 500 }
    );
  }
}