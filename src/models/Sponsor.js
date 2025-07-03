import mongoose from "mongoose";

const SponsorSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  type: { type: String, enum: ["Sponsor-Yatheem", "Sponsor-Hafiz"]},
  // program: { type: String, required: true },
  email: { type: String},
  period: { type: String, required: true }, 
  district: { type: String, required: true },
  panchayat: { type: String, required: true },
  status:{type:String,required:true,default:"Completed"},
  razorpayPaymentId: { type: String, required: true },
  razorpayOrderId: { type: String, required: true },
  razorpaySignature: { type: String,  },
  createdAt: { type: Date, default: Date.now },
}, { 
  collection: "donations" // Explicitly set the collection name
});

export default mongoose.models.Sponsor || mongoose.model("Sponsor", SponsorSchema);