import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectToDatabase from "../../../lib/db";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Function to standardize phone number with country code
function standardizePhoneNumber(phone, defaultCountryCode = "+91") {
  if (!phone) return "";
  const cleanPhone = phone.replace(/\D/g, "");
  if (phone.startsWith("+")) {
    return phone;
  }
  return `${defaultCountryCode}${cleanPhone}`;
}

export async function POST(req) {
  try {
    // Validate environment variables
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials are missing");
    }
    if (!process.env.NEXT_PUBLIC_API_URL) {
      throw new Error("NEXT_PUBLIC_API_URL is missing");
    }

    // Connect to database
    await connectToDatabase();

    // Validate Content-Type
    if (req.headers.get("content-type") !== "application/json") {
      return NextResponse.json({ error: "Invalid Content-Type. Expected application/json" }, { status: 415 });
    }

    // Parse the request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error("Body parsing error:", error);
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Log for debugging
    console.log("Parsed body:", body);

    // Destructure body
    const {
      amount,
      donorId,
      subscriptionId,
      type,
      name,
      phone,
      email,
      district,
      panchayat,
      message,
      period,
      boxId = null,
      instituteId = null,
      campaignId = null,
      callbackUrl,
    } = body;

    // Validate required fields
    const missingFields = [];
    if (!amount && amount !== 0) missingFields.push("amount");
    if (!type) missingFields.push("type");
    if (!name) missingFields.push("name");
    if (!phone) missingFields.push("phone");
    if (!district) missingFields.push("district");
    if (!panchayat) missingFields.push("panchayat");

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    // Standardize phone number
    const standardizedPhone = standardizePhoneNumber(phone);

    // Convert amount to paise
    const amountInPaise = Math.round(amount ); // 
    // 
    // Convert to paise here
    const normalizedPhone = phone.replace(/^(\+91|91)/, '');
    // Create Razorpay order
    const orderData = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1, // Auto-capture enabled
      notes: {
        fullName: name || "Anonymous",
        type: type || "General",
        phone: normalizedPhone,
        email: email || "",
        period: period || "",
        donorId:donorId, 
        subscriptionID: subscriptionId || "",
        district: district || "",
        panchayat: panchayat || "",
        message: message || "",
        boxId: boxId || null,
        instituteId: instituteId || null,
        campaignId: campaignId || null,
      },
    };

    console.log("Creating Razorpay order with data:", orderData);
    let orderResponse;
    try {
      orderResponse = await razorpay.orders.create(orderData);
      console.log("Razorpay order created:", orderResponse);
    } catch (razorpayError) {
      console.error("Razorpay error:", razorpayError);
      return NextResponse.json(
        { error: "Failed to create Razorpay order", details: razorpayError.message },
        { status: 500 }
      );
    }

    const orderId = orderResponse.id;
    if (!orderId) throw new Error("Failed to create order");

    // Construct payment link
    const paymentLink = `${process.env.NEXT_PUBLIC_API_URL}/ios-payment?orderId=${orderId}&amount=${amount}&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(standardizedPhone)}&district=${encodeURIComponent(district)}&panchayat=${encodeURIComponent(panchayat)}&type=${encodeURIComponent(type)}&email=${encodeURIComponent(email || "")}&message=${encodeURIComponent(message || "")}&boxId=${boxId || ""}&instituteId=${instituteId || ""}&campaignId=${campaignId || ""}&callbackUrl=${encodeURIComponent(callbackUrl || "")}`;

    // Return response with payment link
    return NextResponse.json({
      paymentLink,
      orderId,
      message: "Order created. Redirecting to payment page.",
    }, { status: 200 });
  } catch (error) {
    console.error("Error in normal-payment:", error);
    return NextResponse.json({
      error: "Failed to create payment order",
      details: error.message || "Unknown error",
    }, { status: 500 });
  }
}