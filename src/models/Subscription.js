import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", required: true },
  amount: { type: Number, required: true },
  name: { type: String, required: true },
  email: { type: String},
  phone: { type: String, required: true },
  method: { type: String, enum: ["auto", "manual"], required: true, default: "manual" },
  status: { type: String, enum: ["active", "inactive"], required: true, default: "active" },
  period: { type: String, enum: ["daily", "weekly", "monthly", "yearly"], required: true },
  district: { type: String, default: null },
  panchayat: { type: String, default: null },
  lastPaymentAt: { type: Date, default: Date.now, required: true },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  // Auto-specific fields (optional)
  planId: { type: String, default: null }, // Razorpay plan ID
  razorpaySubscriptionId: { type: String, default: null }, // Razorpay subscription ID
}, { collection: "subscriptions" });

export default mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);










// import mongoose from "mongoose";

// const subscriptionSchema = new mongoose.Schema({
//   donorId: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", required: true },
//   amount: { type: Number, required: true },
//   name: { type: String, required: true },
//   method: { type: String, required: true,default:"manual" },
//   status: { type: String, required: true,default: "active" },
//   phone: { type: String, required: true },
//   period: { type: String, enum: ["daily", "weekly", "monthly", "yearly"], required: true },
//   district: { type: String, default: null },
//   panchayat: { type: String, default: null },
//   lastPaymentAt: { type: Date, default: Date.now, required:true },
//   createdAt: { type: Date, default: Date.now },
//   isActive: { type: Boolean, default: true },
// });

// module.exports = mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema); 