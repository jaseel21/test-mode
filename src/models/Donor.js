import mongoose from "mongoose";

const donorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  period: { type: String, default: null }, 
  email:{type:String},
  phone: { type: String, required: true, unique: true },
  role: { type: String, default:"Subscriber", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Donor || mongoose.model("Donor", donorSchema);
