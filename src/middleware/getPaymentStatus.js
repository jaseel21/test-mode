import { NextResponse } from "next/server";

export function getPaymentStatus(period, lastPaymentAt) {
  const now = new Date();
  const lastPaymentDate = new Date(lastPaymentAt);

  // If lastPaymentDate is invalid, return "pending"
  if (isNaN(lastPaymentDate.getTime())) return "pending";

  // Calculate the time difference in milliseconds
  const timeDiff = now - lastPaymentDate;
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Convert to days

  switch (period) {
    case "daily":
      // Valid for 1 day (same day as last payment)
      return daysDiff < 1 ? "paid" : "pending";

    case "weekly":
      // Valid for 7 days from last payment
      return daysDiff < 7 ? "paid" : "pending";

    case "monthly":
      // Valid for 30 days from last payment
      return daysDiff < 30 ? "paid" : "pending";

    case "yearly":
      // Valid for 360 days from last payment
      return daysDiff < 360 ? "paid" : "pending";

    default:
      return "pending";
  }
}

export function paymentStatusMiddleware(handler) {
  return async (request, ...args) => {
    // Store period and lastPaymentAt in request context (we’ll set these in the handler)
    const response = await handler(request, ...args);

    if (!response.ok || response.status >= 400) {
      return response;
    }

    const data = await response.json();
    const { subscriptions, period, lastPaymentAt } = data;

    if (!subscriptions || period === undefined || lastPaymentAt === undefined) {
      return NextResponse.json(data); // Return unchanged if required data is missing
    }

    // Calculate paymentStatus using provided period and lastPaymentAt
    const paymentStatus = getPaymentStatus(period, lastPaymentAt);

    // Enrich the subscriptions with the computed paymentStatus
    const enrichedSubscriptions = subscriptions.map((sub) => ({
      ...sub,
      paymentStatus,
    }));

    return NextResponse.json({
      subscriptions: enrichedSubscriptions,
      period,
      lastPaymentAt,
      paymentStatus,
    });
  };
}