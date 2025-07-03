import mongoose from "mongoose";

const PushTokenSchema = new mongoose.Schema(
  {
    expoPushToken: { type: String, unique: true },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

export default mongoose.models.PushToken || mongoose.model("PushToken", PushTokenSchema);