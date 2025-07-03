// File: /models/PhysicalDonation.js

import mongoose from "mongoose";

const FAdonationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"], // Adding validation
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"], // Adding validation
      match: [/^\d{10}$/, "Phone number must be 10 digits"], // Optional validation
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Type is required"], // Adding validation
      default: "Campaign",
    },
    category: {
      type: String,
      required: [true, "Category is required"], // Adding validation
      enum: ["fundraising", "physical", "fixedamount"], // Match your campaign types
    },
    district: {
      type: String,
      required: [true, "District is required"], // Adding validation
      default: "Other",
      trim: true,
    },
    panchayat: {
      type: String,
      required: [true, "Panchayat is required"], // Adding validation
      default: "",
      trim: true,
    },
    count: {
      type: Number,
      required: [true, "Count (quantity) is required"], // Adding validation
      min: [0, "Count cannot be negative"],
    },
    quantity: {
        type: Number,
        required: [true, "Count (quantity) is required"], // Adding validation
        min: [0, "Count cannot be negative"],
      },
      amount: {
        type: Number,
        required: [true, "Count (quantity) is required"], // Adding validation
        min: [0, "Count cannot be negative"],
      },
      rate: {
        type: Number,
        required: [true, "Count (quantity) is required"], // Adding validation
        min: [0, "Count cannot be negative"],
      },
      area: {
        type: String,
        required: [true, "Count (quantity) is required"], // Adding validation
        min: [0, "Count cannot be negative"],
      },
    campaignId: {
      type: String,
      required: [true, "Campaign ID is required"], // Adding validation
      trim: true,
      index: true, // For faster lookups
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    paymentDate: { type: Date, default: Date.now },
  },
  {
     collection: "donations" // Adds createdAt and updatedAt
  }
);

// Use ES Modules export since you're using import
export default mongoose.models.FAdonation || mongoose.model("FAdonation", FAdonationSchema);