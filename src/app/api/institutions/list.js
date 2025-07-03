import connectToDatabase from "../../lib/db";
import Institute from "../../models/Institute";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  await connectToDatabase();

  try {
    const institutes = await Institute.find({});
    res.status(200).json(institutes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch institutes" });
  }
}