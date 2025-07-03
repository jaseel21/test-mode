import connectToDatabase from "../../lib/db";
import Donation from "../../models/Donation";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  await connectToDatabase();

  try {
    const donations = await Donation.find({});
    // Add jsPDF or Excel export logic here
    res.status(200).json({ message: "Report exported", data: donations });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: "Failed to export report" });
  }
}