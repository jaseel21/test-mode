import mongoose from "mongoose";

const autoDonationSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: "Donor" }, // Optional, if you have a Donor model
  razorpaySubscriptionId: { type: String, required: true }, // Razorpay subscription ID
  // userId: { type: String, required: true }, // Fallback if no donorId (e.g., email)
  name: { type: String, required: true },
  email: { type: String},
  phone: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, default: "General" }, // e.g., "General", "Education"
  district: { type: String, default: null },
  status:{type:String,default:"Completed"},
  method:{type:String,required:true,detault:"auto"},
  panchayat: { type: String, default: null },
  period: { type: String, enum: ["weekly", "monthly", "yearly"], required: true }, // Match subscription periods
  razorpayPaymentId: { type: String, default: null },
  paymentStatus: { type: String, enum: ["paid", "pending", "failed"], default: "paid" },
  paymentDate: { type: Date, default: Date.now },
  subscriptionId: {type: mongoose.Schema.Types.ObjectId, ref: "Donor", required: true },
  createdAt: { type: Date, default: Date.now },
}, { collection: "donations" });

module.exports = mongoose.models.autoDonation || mongoose.model("autoDonation", autoDonationSchema);