import mongoose from "mongoose";
import Donation from "@/models/Donation"; // Adjust path

// Named export for GET method
export async function GET(request, { params }) {
  const { boxId } = params; // Access boxId from dynamic route params

  console.log("Fetching donations for boxId:", boxId);

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const donations = await Donation.find({ boxId }).lean();
    return new Response(JSON.stringify(donations), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching donations:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}