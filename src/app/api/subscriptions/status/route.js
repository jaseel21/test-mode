import connectToDatabase from "@/lib/db";
import Subscription from "@/models/Subscription";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    await connectToDatabase();
    const { donorId } = req.query;

    const subscriptions = await Subscription.find({ donorId });

    const currentDate = new Date();
    
    const updatedSubscriptions = subscriptions.map(sub => ({
      ...sub.toObject(),
      currentStatus: sub.nextPaymentDate > currentDate ? "paid" : "pending"
    }));

    res.json({ subscriptions: updatedSubscriptions });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
