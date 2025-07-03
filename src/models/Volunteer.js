import mongoose from "mongoose";

const VolunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String,  unique: true },
  role: { type: String,  default: 'Volunteer'},
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  place: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.Volunteer || mongoose.model("Volunteer", VolunteerSchema);
