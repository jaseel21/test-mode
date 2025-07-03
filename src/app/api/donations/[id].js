import connectToDatabase from "../../lib/db";
import Donation from "../../models/Donation";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  await connectToDatabase();

  const { id } = req.query;

  try {
    const donation = await Donation.findById(id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    res.status(200).json(donation);
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: "Failed to fetch donation" });
  }
}