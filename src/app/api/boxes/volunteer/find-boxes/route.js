import connectToDatabase from "@/lib/db";
import Box from "@/models/Box";
import Donation from "@/models/Donation";
import { getPaymentStatus } from "@/lib/paymentStatus";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let phone = searchParams.get("phone");

    const sessionUserPhone = phone;

    if (!sessionUserPhone) {
      return new Response(JSON.stringify({ error: "Unauthorized, please log in" }), {
        status: 401,
      });
    }

    await connectToDatabase();
    const boxes = await Box.find({ "sessionUser.phone": sessionUserPhone })
      .lean();

    if (!boxes.length) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    // Add payment status and latest donation details
    const boxesWithDetails = await Promise.all(
      boxes.map(async (box) => {
        const latestDonation = await Donation.findOne({ boxId: box._id })
          .sort({ createdAt: -1 })
          .select("amount razorpayPaymentId createdAt")
          .lean();

        const { status, period } = getPaymentStatus(box.lastPayment);
        return {
          ...box,
          paymentStatus: status,
          currentPeriod: period,
          latestPayment: latestDonation
            ? {
                amount: latestDonation.amount,
                paymentId: latestDonation.razorpayPaymentId,
                date: latestDonation.createdAt,
              }
            : null,
        };
      })
    );

    return new Response(JSON.stringify(boxesWithDetails), { status: 200 });
  } catch (error) {
    console.error("Error fetching boxes:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}