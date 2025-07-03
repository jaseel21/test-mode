import { NextResponse } from "next/server";

// Helper function to calculate payment status and next due date
export function getPaymentStatus(period, lastPaymentAt) {
  const now = new Date();
  const lastPaymentDate = new Date(lastPaymentAt);

  // If lastPaymentDate is invalid, return "pending" with no due date
  if (isNaN(lastPaymentDate.getTime())) {
    return { paymentStatus: "pending", nextDueDate: null };
  }

  // Calculate the time difference in milliseconds
  const timeDiff = now - lastPaymentDate;
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Convert to days

  let nextDueDate;
  let paymentStatus;

  switch (period) {
    case "daily":
      // Valid for 1 day
      paymentStatus = daysDiff < 1 ? "paid" : "pending";
      nextDueDate = new Date(lastPaymentDate);
      nextDueDate.setDate(lastPaymentDate.getDate() + 1); // Next day
      break;

    case "weekly":
      // Valid for 7 days
      paymentStatus = daysDiff < 7 ? "paid" : "pending";
      nextDueDate = new Date(lastPaymentDate);
      nextDueDate.setDate(lastPaymentDate.getDate() + 7); // 7 days from last payment
      break;

    case "monthly":
      // Valid for 30 days
      paymentStatus = daysDiff < 30 ? "paid" : "pending";
      nextDueDate = new Date(lastPaymentDate);
      nextDueDate.setDate(lastPaymentDate.getDate() + 30); // 30 days from last payment
      break;

    case "yearly":
      // Valid for 360 days
      paymentStatus = daysDiff < 360 ? "paid" : "pending";
      nextDueDate = new Date(lastPaymentDate);
      nextDueDate.setDate(lastPaymentDate.getDate() + 360); // 360 days from last payment
      break;

    default:
      paymentStatus = "pending";
      nextDueDate = null;
      break;
  }

  return {
    paymentStatus,
    nextDueDate: nextDueDate ? nextDueDate.toISOString() : null, // Convert to ISO string for consistency
  };
}

export function paymentStatusMiddleware(handler) {
  return async (request, ...args) => {
    const response = await handler(request, ...args);

    if (!response.ok || response.status >= 400) {
      return response;
    }

    const data = await response.json();

    // Handle single subscription case (e.g., /api/subscriptions/details)
    if (data.subscription) {
      const { paymentStatus, nextDueDate } = getPaymentStatus(
        data.subscription.period,
        data.subscription.lastPaymentAt
      );
      const enrichedSubscription = {
        ...data.subscription,
        paymentStatus,
        nextDueDate,
      };
      return NextResponse.json({
        ...data,
        subscription: enrichedSubscription,
      });
    }

    // Handle multiple subscriptions case (e.g., /api/subscriptions/all)
    if (data.subscriptions) {
      const enrichedSubscriptions = data.subscriptions.map((sub) => {
        const { paymentStatus, nextDueDate } = getPaymentStatus(sub.period, sub.lastPaymentAt);
        return {
          ...sub,
          paymentStatus,
          nextDueDate,
        };
      });
      return NextResponse.json({
        ...data,
        subscriptions: enrichedSubscriptions,
      });
    }

    // Return unchanged if neither subscription nor subscriptions is present
    return NextResponse.json(data);
  };
}