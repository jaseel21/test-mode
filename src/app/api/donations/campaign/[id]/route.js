// src/app/api/donations/campaign/[id]/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../lib/db";
import Donation from "../../../../../models/Donation";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;

    const donations = await Donation.find({ campaignId: id }).lean();

    const formattedDonations = donations.map((donation) => ({
      id: donation._id.toString(),
      name: donation.name || "Anonymous",
      amount: donation.amount,
      date: new Date(donation.createdAt).toISOString().split("T")[0],
      method: donation.razorpayPaymentId ? "Online" : "Direct",
      status: donation.status,
    }));

    console.log("Fetched donations:", formattedDonations);
    return NextResponse.json(formattedDonations);
  } catch (error) {
    console.error("Error fetching donations:", error);
    return NextResponse.json({ error: "Failed to fetch donations", details: error.message }, { status: 500 });
  }
}






// // src/app/api/donations/campaign/[id]/route.js
// import { NextResponse } from "next/server";
// import connectToDatabase from "../../../../../lib/db"; // Adjust path as needed
// import Donation from "../../../../../models/Donation"; // Adjust path as needed

// export async function GET(request, { params }) {
//   try {
//     // Connect to the database
//     await connectToDatabase();

//     // Extract campaignId from the dynamic route
//     const { id } = params;

//     // Fetch all donations for the campaign
//     const donations = await Donation.find({ campaignId: id }).lean();

//     // Format donations for the frontend
//     const formattedDonations = donations.map((donation) => ({
//       id: donation._id.toString(),
//       name: donation.name || "Anonymous",
//       amount: donation.amount,
//       date: new Date(donation.createdAt).toISOString().split("T")[0], // Format as YYYY-MM-DD
//       method: donation.razorpayPaymentId ? "Online" : "Direct", // Infer payment method
//       status: donation.status,
//     }));

//     // Log for debugging
//     console.log("Fetched donations:", formattedDonations);

//     // Return the formatted donations
//     return NextResponse.json(formattedDonations);
//   } catch (error) {
//     console.error("Error fetching donations:", error);
//     return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 });
//   }
// }