import connectToDatabase from "../../lib/db";
import Institute from "../../models/Institute";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  await connectToDatabase();

  const { name } = req.body;

  try {
    const institute = new Institute({ name });
    await institute.save();
    res.status(201).json({ message: "Institute created", id: institute._id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create institute" });
  }
}