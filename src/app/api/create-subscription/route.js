import Razorpay from "razorpay";
import connectDB from "../../../lib/db";
import { NextResponse } from "next/server";
// import twilio from "twilio";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(req) {
  try {
    await connectDB();
    const { planId,period ,phone,amount,name,district,panchayat,email} = await req.json();

    console.log("panchayath",panchayat);
    


    if ( !planId) {
      return NextResponse.json({ error: "Missing userId or planId" }, { status: 400 });
    }

   
    const totalCount = { weekly: 52, monthly: 12, yearly: 1 }[period] || 12;
    const razorpaySubscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: totalCount,
      notes: {
        razorpaySubscriptionId: "", // Subscription ID added here
        name: name || "Anonymous",
        amount: (amount / 100).toString(), // Convert to rupees and store as string
        phoneNumber: phone,
        district: district || "",
        type: "Subscription-auto",
        method: "auto",
        planId,
        email: email || "",
        panchayat: panchayat || "",
        period,
      },
    });

   
    
    // const fromNumber = `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`;
    
    //   const toNumber =  `whatsapp:+91${phone}`;
    // try {
    //   await twilioClient.messages.create({
    //     body: `Your ${period} donation subscription is created! Amount: ₹${amount}. Please complete the initial payment.`,
    //     from: fromNumber,
    //     to: toNumber,
    //   });
    // } catch (twilioError) {
    //   console.error("Twilio error:", twilioError.message);
    // }

    return NextResponse.json({ subscriptionId: razorpaySubscription.id });
  } catch (error) {
    console.error("Subscription creation error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}