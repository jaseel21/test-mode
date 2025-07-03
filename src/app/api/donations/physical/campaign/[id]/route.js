// src/app/api/donations/physical/campaign/[id]/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../../lib/db"; // Adjust path
import PhysicalDonation from "../../../../../../models/PhysicalDonation"; // Adjust path

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;

    const physicalDonations = await PhysicalDonation.find({ campaignId: id }).lean();

    const formattedDonations = physicalDonations.map((donation) => ({
      id: donation._id.toString(),
      name: donation.name,
      phone: donation.phone,
      count: donation.quantity,
      district: donation.district,
      panchayat: donation.panchayat,
      date: new Date(donation.createdAt).toISOString().split("T")[0],
    }));

    console.log("Fetched physical donations:", formattedDonations);
    return NextResponse.json(formattedDonations);
  } catch (error) {
    console.error("Error fetching physical donations:", error);
    return NextResponse.json({ error: "Failed to fetch physical donations", details: error.message }, { status: 500 });
  }
}