import mongoose from "mongoose";

const NotificationHistorySchema = new mongoose.Schema(
  {
    title: { 
      type: String 
    },
    body: { 
      type: String, 
      required: true 
    },
    subject: { 
      type: String 
    },
    imageUrl: { 
      type: String 
    },
    channel: { 
      type: String, 
      required: true, 
      enum: ["push", "email", "whatsapp"] 
    },
    userGroup: { 
      type: String, 
      required: true,
      enum: ["all", "subscribers", "boxholders", "custom"] 
    },
    status: { 
      type: String, 
      enum: ["Pending", "Sending", "Delivered", "Failed", "Scheduled"],
      default: "Pending"
    },
    templateId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "NotificationTemplate" 
    },
    sentAt: { 
      type: Date 
    },
    scheduledFor: { 
      type: Date 
    },
    createdBy: { 
      type: String 
    },
    sentCount: {
      type: Number,
      default: 0
    },
    deliveredCount: {
      type: Number,
      default: 0
    },
    failedCount: {
      type: Number,
      default: 0
    },
    recipients: {
      type: [String],
      default: []
    },
    metaData: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

export default mongoose.models.NotificationHistory || 
  mongoose.model("NotificationHistory", NotificationHistorySchema);