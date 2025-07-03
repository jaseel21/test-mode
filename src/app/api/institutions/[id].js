import connectToDatabase from "../../lib/db";
import Institute from "../../models/Institute";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  await connectToDatabase();

  const { id } = req.query;

  try {
    const institute = await Institute.findById(id);
    if (!institute) return res.status(404).json({ message: "Institute not found" });
    res.status(200).json(institute);
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: "Failed to fetch institute" });
  }
}