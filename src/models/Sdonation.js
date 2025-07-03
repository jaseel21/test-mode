import mongoose from "mongoose";

const SdonationSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", required: true },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  amount: { type: Number, required: true },
  email: { type: String},
  type: { type: String, required: true, default: "General" },
  district: { type: String, default: null },
  panchayat: { type: String, default: null },
  period: { type: String, enum: ["daily", "weekly", "monthly", "yearly"], required: true },
  razorpayPaymentId: { type: String, default: null },
  status: { type: String, default: "Completed" },
  method: { type: String,required:true, default: "manual" },
  razorpayOrderId: { type: String, default: null },
  paymentStatus: { type: String, enum: ["paid", "pending"], default: "paid" },
  paymentDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
}, { collection: "donations" });

export default mongoose.models.Sdonation || mongoose.model("Sdonation", SdonationSchema);