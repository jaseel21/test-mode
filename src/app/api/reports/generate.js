import connectToDatabase from "../../lib/db";
import Donation from "../../models/Donation"; // Example model

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  await connectToDatabase();

  const { type } = req.body;

  try {
    const data = await (type === "donations" ? Donation : Volunteer).find({}); // Example
    res.status(200).json({ message: "Report generated", data });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: "Failed to generate report" });
  }
}