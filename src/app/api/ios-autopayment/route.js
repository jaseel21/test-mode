// src/app/api/ios-autopayment/route.js
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectToDatabase from "../../../lib/db";
// import Sponsor from "../../../models/AutoSubscription";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const getBillingCycles = (period) => {
  const periodMap = {
    daily: 30,
    weekly: 52,
    monthly: 12,
    yearly: 1,
  };
  return periodMap[period.toLowerCase()] || 12;
};

export async function POST(req) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { fullName,
       location,
        amount,
         period, 
         phone,
          email,
          callbackUrl
        } = body;

console.log(body);

        function standardizePhoneNumber(phone, defaultCountryCode = "+91") {
  if (!phone) return ""; 
  const cleanPhone = phone.replace(/\D/g, "");
  if (phone.startsWith("+")) {
    return phone; 
  }
  return `${defaultCountryCode}${cleanPhone}`;
}

// Standardize the phone number
const standardizedPhone = standardizePhoneNumber(phone);

    if (!fullName || !location || !amount || !period || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [district, panchayat] = location.split(", ").map((part) => part.trim());
    const amountInPaise = Math.round(amount * 100);

    // Step 1: Create a Razorpay Plan
    const planData = {
      period: period.toLowerCase(),
      interval: 1,
      item: {
        name: `${fullName}'s ${period} Donation Plan`,
        amount: amountInPaise,
        currency: "INR",
        description: `Donation plan for ${period} subscription`,
      },
    };

    const planResponse = await razorpay.plans.create(planData);
    const planId = planResponse.id;
    if (!planId) throw new Error("Failed to create plan");

    // Step 2: Create a Razorpay Subscription
    const subscriptionData = {
      plan_id: planId,
      total_count: getBillingCycles(period),
      customer_notify: 1,
      notify_info: {
        notify_phone: phone,
        notify_email: email || "default@example.com",
      },
      notes: {
        razorpaySubscriptionId: "", // Subscription ID added here
        name: fullName || "Anonymous",
        amount: amountInPaise, // Convert to rupees and store as string
        phoneNumber: standardizedPhone,
        district: district || "",
        type: "Subscription-auto",
        method: "auto",
        planId,
        email: email || "",
        panchayat: panchayat || "",
        period,
      },
    };

    const subscriptionResponse = await razorpay.subscriptions.create(subscriptionData);
    const subscriptionId = subscriptionResponse.id;
    if (!subscriptionId) throw new Error("Failed to create subscription");

    // Step 3: Save initial subscription details (pending payment)
    // const subscriptionDetails = new Sponsor({
    //   donorId: "507f1f77bcf86cd799439011", // Hardcoded for now
    //   razorpaySubscriptionId: subscriptionId,
    //   planId,
    //   name: fullName,
    //   amount,
    //   phone: phone.startsWith("+") ? phone : `+91${phone}`,
    //   district,
    //   panchayat,
    //   period,
    //   type: "General",
    //   method: "auto",
    //   status: "pending",
    //   email: email || null,
    //   createdAt: new Date(),
    // });

    // await subscriptionDetails.save();

    // Step 4: Generate redirect URL to payment page
    const redirectUrl = `${process.env.NEXT_PUBLIC_API_URL}/payment?subscriptionId=${subscriptionId}&amount=${amount}&name=${encodeURIComponent(fullName)}&phone=${phone}&district=${district}&panchayat=${panchayat}&planId=${planId}&period=${period}&email=${email}&callbackUrl=${callbackUrl}`;

    // Step 5: Return JSON with redirect instruction
    return NextResponse.json({
      // donationId: subscriptionDetails._id,
      redirectUrl, // Frontend will use this to auto-redirect
      message: "Subscription created. Redirecting to payment page to activate autopayment.",
    }, { status: 200 });
  } catch (error) {
    console.error("Error in setup-autopayment:", error);
    return NextResponse.json({
      error: "Failed to setup autopayment",
      details: error.message || "Unknown error",
    }, { status: 500 });
  }
}