import mongoose from "mongoose";

const AutoSubscriptionSchema = new mongoose.Schema({
  planId: { type: String, required: true }, // Razorpay plan ID
  razorpaySubscriptionId: { type: String }, // Razorpay subscription ID
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", required: true },
    amount: { type: Number, required: true },
    name: { type: String, required: true },
    email:{type:String},
    phone: { type: String, required: true },
    period: { type: String, enum: ["daily", "weekly", "monthly", "yearly"], required: true },
    district: { type: String, default: null },
    panchayat: { type: String, default: null },
    lastPaymentAt: { type: Date, default: Date.now, required:true },
    status:{ type:String , required:true,default:"Completed"},
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    method: { type: String, required:true, default:"auto" },
    createdAt: { type: Date, default: Date.now },
},{collection:"subscriptions"});

export default mongoose.models.AutoSubscription || mongoose.model("AutoSubscription", AutoSubscriptionSchema);  