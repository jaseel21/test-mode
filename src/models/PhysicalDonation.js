// File: /models/PhysicalDonation.js

import mongoose from "mongoose";
const PhysicalDonationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
     
    },
    phone: {
      type: String,
     
    },
    type: {
      type: String,
     
      default: "Campaign",
    },
    category: {
      type: String,
    
    },
    district: {
      type: String,
      
    },
    panchayat: {
      type: String,
    
    },
    quantity: {
      type: Number,
    
    },
    campaignId: {
      type: String,
     
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.PhysicalDonation || mongoose.model("PhysicalDonation", PhysicalDonationSchema);