import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import Box from "../../../../models/Box";
import Donation from "../../../../models/Donation"; // Import Donation model
import { getPaymentStatus } from "@/lib/boxPaymentStatus";

export async function GET(request) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    let phone = searchParams.get("phone");

    console.log("Received phone number:", phone); // Debugging log

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Optionally add country code prefix (uncomment if needed)
    // phone = "+91" + phone;

    // Connect to the database
    await connectToDatabase();

    // Query MongoDB for boxes
    const boxes = await Box.find({ phone }).lean();

    if (!boxes || boxes.length === 0) {
      return NextResponse.json({ error: "No boxes found for this phone number" }, { status: 404 });
    }

    // Format response data with totalAmount calculation
    const formattedBoxes = await Promise.all(
      boxes.map(async (box) => {
        const lastPaymentDate = new Date(box.lastPayment);
        const currentDate = new Date();

        let status = "dead"; // Default status

        if (!isNaN(lastPaymentDate.getTime())) {
          const monthsDiff =
            (currentDate.getFullYear() - lastPaymentDate.getFullYear()) * 12 +
            (currentDate.getMonth() - lastPaymentDate.getMonth());

          if (monthsDiff >= 4) {
            status = "overdue";
          } else if (box.isActive === true) {
            status = "active";
          }
        } else {
          console.log("Invalid lastPayment date for box:", box._id, box.lastPayment);
        }

        // Calculate totalAmount from Donation collection
        const donationTotal = await Donation.aggregate([
          { $match: { boxId: box._id.toString(), status: "Completed" } }, // Match donations for this box
          { $group: { _id: null, total: { $sum: "$amount" } } }, // Sum all amounts
        ]);

         let { Status,period } = getPaymentStatus(box.lastPayment);
         if(box.lastPayment===null){
          status="dead"
         }
        

        const totalAmount = donationTotal.length > 0 ? donationTotal[0].total : 0; // Default to 0 if no donations

        return {
          paymentStatus: Status,
          currentPeriod: period,
          id: box._id.toString(),
          serialNumber: box.serialNumber,
          name: box.name,
          district: box.district,
          panchayath: box.panchayath,
          totalAmount, // Calculated total amount from donations
          lastPayment: box.lastPayment,
          status,
        };
      })
    );

    return NextResponse.json(formattedBoxes, { status: 200 });
  } catch (error) {
    console.error("Error fetching boxes:", error);
    return NextResponse.json({ error: "Failed to fetch boxes" }, { status: 500 });
  }
}

// import { NextResponse } from "next/server";
// import connectToDatabase from "../../../../lib/db";
// import Box from "../../../../models/Box"; // Your MongoDB connection utility

// export async function GET(request) {
//   try {
//     // ✅ Extract search parameters properly
//     const url = new URL(request.url);
//     let phone = url.searchParams.get("phone"); // Fix: Match frontend request

//     console.log("Received phone number:", phone); // Debugging log

//     if (!phone) {
//       return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
//     }
//     phone = "+919539161853"

//     await connectToDatabase();
//     const boxes = await Box.find({ phone }).lean();

//     // ✅ Handle cases where no boxes are found
//     if (!boxes || boxes.length === 0) {
//       return NextResponse.json({ error: "No boxes found for this phone number" }, { status: 404 });
//     }

//     // ✅ Map and format the response properly
//     const formattedBoxes = boxes.map((box) => {
//       const lastPaymentDate = new Date(box.lastPayment);
//       const currentDate = new Date();

//       if (isNaN(lastPaymentDate.getTime())) {
//         console.log("Invalid lastPayment date:", box.lastPayment);
//         return {
//           id: box._id.toString(),
//           serialNumber: box.serialNumber,
//           amountDue: parseInt(box.amount),
//           lastPayment: box.lastPayment,
//           status: "dead",
//         };
//       }

//       const monthsDiff =
//         (currentDate.getFullYear() - lastPaymentDate.getFullYear()) * 12 +
//         (currentDate.getMonth() - lastPaymentDate.getMonth());

//       let status = "dead";
//       if (monthsDiff >= 4) {
//         status = "overdue";
//       } else if (box.isActive === true) {
//         status = "active";
//       }

//       return {
//         id: box._id.toString(),
//         serialNumber: box.serialNumber,
//         amountDue: parseInt(box.amount),
//         lastPayment: box.lastPayment,
//         status,
//       };
//     });

//     return NextResponse.json(formattedBoxes, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching boxes:", error);
//     return NextResponse.json({ error: "Failed to fetch boxes" }, { status: 500 });
//   }
// }
