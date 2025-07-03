import mongoose from "mongoose";

const BoxHolderTokenSchema = new mongoose.Schema({
  expoPushToken: {type: String,unique: true
  },
});

export default mongoose.models.BoxHolderToken || mongoose.model("BoxHolderToken", BoxHolderTokenSchema);