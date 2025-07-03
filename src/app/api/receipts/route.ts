// src/app/api/receipts/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Donation from "@/models/FetchDonation";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get("phone");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10); // Default to 10 items per page

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Format phone number to match your database format (prepend +91)
    const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;

    // Connect to MongoDB
    await connectToDatabase();

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count of donations for this phone number
    const totalDonations = await Donation.countDocuments({ phone: formattedPhone });

    // Calculate total amount using aggregation
    const totalAmountResult = await Donation.aggregate([
      { $match: { phone: formattedPhone } }, // Match donations for this phone
      { $group: { _id: null, total: { $sum: "$amount" } } }, // Sum all amounts
    ]);

    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;

    // Fetch paginated donations
    const donations = await Donation.find({ phone: formattedPhone })
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate total pages
    const totalPages = Math.ceil(totalDonations / limit);

    return NextResponse.json({
      receipts: donations,
      totals: {
        totalAmount, // Total sum of all donation amounts
        totalDonations, // Total count of donations
      },
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalDonations,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching receipts:", error);
    return NextResponse.json({ error: "Failed to fetch receipts" }, { status: 500 });
  }
} 




// import { NextRequest, NextResponse } from 'next/server';
// import connectToDatabase from '@/lib/db';
// import Donation from '@/models/Donation';

// export async function GET(request: NextRequest) {
//   try {
//     const searchParams = request.nextUrl.searchParams;
//     const phone = searchParams.get('phone');
//     const page = parseInt(searchParams.get('page') || '1', 10);
//     const limit = parseInt(searchParams.get('limit') || '10', 10); // Default to 10 items per page

//     if (!phone) {
//       return NextResponse.json(
//         { error: 'Phone number is required' },
//         { status: 400 }
//       );
//     }

//     // Format phone number to match your database format (prepend +91)
//     const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

//     // Connect to MongoDB
//     await connectToDatabase();

//     // Calculate skip value for pagination
//     const skip = (page - 1) * limit;

//     // Get total count of donations for this phone number
//     const totalDonations = await Donation.countDocuments({ phone: formattedPhone });

//     // Fetch paginated donations
//     const donations = await Donation.find({ phone: formattedPhone })
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     // Calculate total pages
//     const totalPages = Math.ceil(totalDonations / limit);

//     return NextResponse.json({
//       receipts: donations,
//       pagination: {
//         currentPage: page,
//         totalPages: totalPages,
//         totalItems: totalDonations,
//         itemsPerPage: limit,
//       },
//     });
//   } catch (error) {
//     console.error('Error fetching receipts:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch receipts' },
//       { status: 500 }
//     );
//   }
// }