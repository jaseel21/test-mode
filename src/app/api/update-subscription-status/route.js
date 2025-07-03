import connectDB from "../../../lib/db";
import Subscription from "../../../models/AutoSubscription";
import Donation from "../../../models/AutoDonation";
import { NextResponse } from "next/server";
import Donor from "../../../models/Donor"
// import twilio from "twilio";

// const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(req) {
  try {
    await connectDB();
    const { razorpaySubscriptionId,planId,name,method,amount,period,district,razorpay_payment_id,panchayat,email ,status,phoneNumber } = await req.json();
    
    let phone = "+91" + phoneNumber; 

       let donor = await Donor.findOne({ phone });
    if (!donor) {
          console.log("Creating new donor...");
          donor = await Donor.create({ name, phone,email,  period});
   } else {
          console.log("Donor already exists:", donor);
          return NextResponse.json({ exist: true });
    }
 
    // if (!razorpaySubscriptionId || !razorpay_payment_id || !status) {
    //   return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    // }

    // const subscription = await Subscription.findOne({ razorpaySubscriptionId });
    // if (!subscription) {
    //   return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    // }

    const subscription = new Subscription({
      donorId:donor._id,
      razorpaySubscriptionId,
      planId,
      name:donor.name,
      amount,
      district,
      panchayat,
      period,
      email,
      phone:"+91"+phoneNumber,
      interval:1,
      planId,
      status,
      method,
    });
    await subscription.save();
    console.log("Subscription saved to DB:", subscription);

    const donation = new Donation({
      donorId:donor._id,
      razorpaySubscriptionId,
      name: subscription.name || "Anonymous", // Fallback if name isn’t stored in Subscription
      phone: phone,
      amount: subscription.amount,
      period: subscription.period,
      district:subscription.district,
      panchayat:subscription.panchayat,
      planId:subscription.planId,
      email,
      razorpayPaymentId: razorpay_payment_id,
      status:"Completed",
      method:"auto",
      paymentStatus: "paid",
      subscriptionId:subscription._id,
    });
    await donation.save();
    console.log("Initial donation recorded:", donation);

    // const fromNumber = `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`;
    // // const toNumber = subscription.phoneNumber.startsWith("+")
    //    const toNumber = `whatsapp:${subscription.phoneNumber}`
    //   // : `whatsapp:+91${subscription.phoneNumber}`;
    // try {
    //   await twilioClient.messages.create({
    //     body: `Thank you! Your ${subscription.period} donation subscription is now active. Amount: ₹${subscription.amount}. Autopay enabled.`,
    //     from: process.env.TWILIO_WHATSAPP_NUMBER,
    //     to: toNumber,
    //   });
    // } catch (twilioError) {
    //   console.error("Twilio error:", twilioError.message);
    // }

    return NextResponse.json({ message: "Subscription activated and donation recorded" });
  } catch (error) {
    console.error("Update subscription status error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}