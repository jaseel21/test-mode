import connectToDatabase from "../../lib/db";
import Institute from "../../models/Institute";

export default async function handler(req, res) {
  if (req.method !== "PATCH") return res.status(405).json({ message: "Method not allowed" });

  await connectToDatabase();

  const { id, name } = req.body;

  try {
    await Institute.findByIdAndUpdate(id, { name });
    res.status(200).json({ message: "Institute updated" });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: "Failed to update institute" });
  }
}