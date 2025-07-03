
import mongoose from "mongoose";
const donationSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  type: {
    type: String,
    enum: ["General", "Yatheem", "Hafiz", "Building", "Campaign", "Institution",'Box',"Sponsor-Yatheem","Sponsor-Hafiz"],
    required: true,
  },
  boxId: { type: String, default: null },
  campaignId: { type: String, default: null },
  // period: { type: String, default: null },
  instituteId: { type: String, default: null },
  district: { type: String, default: null },
  panchayat: { type: String, default: null },
  email: { type: String, default: null },
  name: { type: String, default: null },
  phone: { type: String, default: null },
  status: { type: String, enum: ["Pending","Failed", "Completed"], default: "Completed" },
  razorpayPaymentId: { type: String, default: null },
  razorpaySignature: { type: String, default: null },
  razorpayOrderId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

const Donation = mongoose.models.Donation || mongoose.model("Donation", donationSchema);

export default Donation;