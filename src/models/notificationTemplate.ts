import mongoose from "mongoose";

const NotificationTemplateSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String, 
      required: true, 
      enum: ["push", "email", "whatsapp"] 
    },
    title: { 
      type: String 
    },
    subject: { 
      type: String 
    },
    body: { 
      type: String, 
      required: true 
    },
    imageUrl: { 
      type: String 
    },
    createdBy: { 
      type: String 
    }
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

export default mongoose.models.NotificationTemplate || 
  mongoose.model("NotificationTemplate", NotificationTemplateSchema);