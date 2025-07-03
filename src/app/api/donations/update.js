import connectToDatabase from "../../lib/db";
import Donation from "../../models/Donation";

export default async function handler(req, res) {
  if (req.method !== "PATCH") return res.status(405).json({ message: "Method not allowed" });

  await connectToDatabase();

  const { id, status } = req.body;

  try {
    await Donation.findByIdAndUpdate(id, { status });
    res.status(200).json({ message: "Donation updated" });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: "Failed to update donation" });
  }
}