import connectToDatabase from "@/lib/db";
import Subscription from "@/models/Subscription";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    await connectToDatabase();

    const { donorId, amount, period, method, paymentMethod, startDate } = req.body;

    const nextPaymentDate = new Date(startDate);
    if (period === "monthly") nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    if (period === "weekly") nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
    if (period === "daily") nextPaymentDate.setDate(nextPaymentDate.getDate() + 1);
    if (period === "yearly") nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);

    const newSubscription = new Subscription({
      donorId,
      amount,
      currency: "INR",
      period,
      method,
      paymentMethod,
      startDate,
      nextPaymentDate,
      status: "active"
    });

    await newSubscription.save();

    res.json({ success: true, subscription: newSubscription });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
